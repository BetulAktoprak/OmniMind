using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OmniMind.Domain.Identity;
using OmniMind.Domain.Identity.ValueObjects;
using OmniMind.Infrastructure.Persistence.Context;
using OmniMind.WebApi.Contracts.Auth;

namespace OmniMind.WebApi.Services.Auth;

public class AuthService : IAuthService
{
    private readonly OmniMindDbContext _db;
    private readonly IJwtTokenService _jwt;
    private readonly PasswordHasher<User> _hasher = new();

    public AuthService(OmniMindDbContext db, IJwtTokenService jwt)
    {
        _db = db;
        _jwt = jwt;
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

        if (!user.IsActive)
            throw new InvalidOperationException(loginFailedMessage);

        var verify = _hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verify == PasswordVerificationResult.Failed)
            throw new InvalidOperationException(loginFailedMessage);

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

}
