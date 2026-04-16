using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using OmniMind.Domain.Identity;
using OmniMind.Domain.Identity.ValueObjects;
using OmniMind.Infrastructure.Persistence.Context;
using OmniMind.WebApi.Contracts.Account;
using OmniMind.WebApi.Contracts.Auth;
using OmniMind.WebApi.Options;

namespace OmniMind.WebApi.Services.Auth;

public class AuthService : IAuthService
{
    private readonly OmniMindDbContext _db;
    private readonly IJwtTokenService _jwt;
    private readonly IOptions<AccountDeletionOptions> _accountDeletion;
    private readonly PasswordHasher<User> _hasher = new();

    public AuthService(
        OmniMindDbContext db,
        IJwtTokenService jwt,
        IOptions<AccountDeletionOptions> accountDeletion)
    {
        _db = db;
        _jwt = jwt;
        _accountDeletion = accountDeletion;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        const string loginFailedMessage =
            "Giriş yapılamadı. E-posta/kullanıcı adı veya parola hatalı.";

        var login = request.Login.Trim();
        var loginLower = login.ToLowerInvariant();

        var user = await _db.Users
            .Include(x => x.Profile)
            .FirstOrDefaultAsync(x =>
            x.Email.Value == loginLower || x.Username.Value == login, cancellationToken);

        if (user is null)
            throw new InvalidOperationException(loginFailedMessage);

        var verify = _hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verify == PasswordVerificationResult.Failed)
            throw new InvalidOperationException(loginFailedMessage);

        if (!user.IsActive)
        {
            if (user.ScheduledHardDeletionAtUtc is { } purgeAt)
            {
                throw new InvalidOperationException(
                    "Bu hesap kapatılmış. Verileriniz " +
                    purgeAt.ToString("yyyy-MM-dd HH:mm") +
                    " (UTC) tarihinden sonra kalıcı olarak silinecek.");
            }

            throw new InvalidOperationException(loginFailedMessage);
        }

        var (token, expiresAt) = _jwt.CreateToken(user);

        return new AuthResponse
        {
            AccessToken = token,
            ExpiresAt = expiresAt,
            UserId = user.Id,
            Email = user.Email.Value,
            Username = user.Username.Value
        };
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var username = request.Username.Trim();

        var exists = await _db.Users.AnyAsync(x =>
            x.Email.Value == email || x.Username.Value == username, cancellationToken);

        if (exists)
            throw new InvalidOperationException("Email veya kullanıcı adı kullanılıyor.");

        var user = new User(
            new Email(email),
            new Username(username)
        );


        var hash = _hasher.HashPassword(user, request.Password);
        user.SetPasswordHash(hash);

        if (!string.IsNullOrWhiteSpace(request.DisplayName))
        {
            user.Profile.Update(
                displayName: request.DisplayName.Trim(),
                bio: null,
                avatarUrl: null
            );
        }

        if (request.Consents is { Count: > 0 })
        {
            foreach (var type in request.Consents.Distinct())
            {
                user.GrantConsent(type);
            }
        }

        var hasAi = request.Consents?.Contains(ConsentType.AIAnalysis) == true;
        var hasShare = request.Consents?.Contains(ConsentType.DataSharing) == true;
        user.UpdatePrivacySettings(
            isProfilePublic: false,
            shareMoodData: hasShare,
            allowAIAnalysis: hasAi);

        _db.Users.Add(user);
        await _db.SaveChangesAsync(cancellationToken);

        var (token, expiresAt) = _jwt.CreateToken(user);

        return new AuthResponse
        {
            AccessToken = token,
            ExpiresAt = expiresAt,
            UserId = user.Id,
            Email = user.Email.Value,
            Username = user.Username.Value
        };
    }

    public async Task<RequestAccountDeletionResponse> RequestScheduledAccountDeletionAsync(
        Guid userId,
        string password,
        CancellationToken cancellationToken)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null)
            throw new InvalidOperationException("Kullanıcı bulunamadı.");

        var verify = _hasher.VerifyHashedPassword(user, user.PasswordHash, password);
        if (verify == PasswordVerificationResult.Failed)
            throw new InvalidOperationException("Parola hatalı.");

        var graceDays = Math.Clamp(_accountDeletion.Value.GraceDays, 1, 365);
        user.RequestScheduledDeletion(TimeSpan.FromDays(graceDays));
        await _db.SaveChangesAsync(cancellationToken);

        return new RequestAccountDeletionResponse
        {
            PurgeAfterUtc = user.ScheduledHardDeletionAtUtc!.Value,
            Message =
                "Hesabınız kapatıldı. Verileriniz sunucuda " + graceDays +
                " gün süreyle saklanır; bu süre sonunda kalıcı olarak silinir."
        };
    }

    public async Task<AccountPreferencesResponse> GetAccountPreferencesAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user is null)
            throw new InvalidOperationException("Kullanıcı bulunamadı.");

        var hasPersonalized = await _db.UserConsents.AsNoTracking().AnyAsync(
            c => c.UserId == userId && c.Type == ConsentType.PersonalizedAds,
            cancellationToken);

        return new AccountPreferencesResponse
        {
            AllowAiJournalAnalysis = user.PrivacySettings.AllowAIAnalysis,
            PersonalizedRecommendations = hasPersonalized
        };
    }

    public async Task UpdateAccountPreferencesAsync(
        Guid userId,
        UpdateAccountPreferencesRequest request,
        CancellationToken cancellationToken)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user is null)
            throw new InvalidOperationException("Kullanıcı bulunamadı.");

        user.UpdatePrivacySettings(
            user.PrivacySettings.IsProfilePublic,
            user.PrivacySettings.ShareMoodData,
            request.AllowAiJournalAnalysis);

        // Kullanıcı koleksiyonundan Remove/Add EF'de bazen yanlış UPDATE üretebiliyor; DbSet ile net sil/ekle.
        await SyncConsentRowAsync(userId, ConsentType.AIAnalysis, request.AllowAiJournalAnalysis, cancellationToken);
        await SyncConsentRowAsync(
            userId,
            ConsentType.PersonalizedAds,
            request.PersonalizedRecommendations,
            cancellationToken);

        await _db.SaveChangesAsync(cancellationToken);
    }

    private async Task SyncConsentRowAsync(
        Guid userId,
        ConsentType type,
        bool shouldExist,
        CancellationToken cancellationToken)
    {
        var existing = await _db.UserConsents
            .Where(c => c.UserId == userId && c.Type == type)
            .ToListAsync(cancellationToken);

        foreach (var row in existing)
            _db.UserConsents.Remove(row);

        if (shouldExist)
            _db.UserConsents.Add(new UserConsent(type, userId));
    }

}
