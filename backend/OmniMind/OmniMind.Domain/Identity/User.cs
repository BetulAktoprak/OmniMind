using OmniMind.Domain.Common;
using OmniMind.Domain.Identity.ValueObjects;

namespace OmniMind.Domain.Identity;
public class User : BaseEntity
{
    public Email Email { get; private set; }
    public Username Username { get; private set; }

    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }

    /// <summary>Kullanıcı hesap silmeyi talep ettiğinde (UTC).</summary>
    public DateTime? AccountDeletionRequestedAtUtc { get; private set; }

    /// <summary>Verilerin kalıcı olarak silineceği an (UTC). Dolana kadar kayıtlar veritabanında kalır.</summary>
    public DateTime? ScheduledHardDeletionAtUtc { get; private set; }

    public string PasswordHash { get; private set; } = default!;
    public DateTime PasswordChangedAt { get; private set; }

    public Profile Profile { get; private set; }
    public PrivacySettings PrivacySettings { get; private set; }
    public BirthInfo? BirthInfo { get; private set; }

    private readonly List<UserConsent> _consents = new();
    public IReadOnlyCollection<UserConsent> Consents => _consents;

    private User() { }

    public User(Email email, Username username)
    {
        Id = Guid.NewGuid();
        Email = email;
        Username = username;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;

        Profile = new Profile(this);
        PrivacySettings = PrivacySettings.Default();
    }

    public void UpdatePrivacySettings(
        bool isProfilePublic,
        bool shareMoodData,
        bool allowAIAnalysis)
    {
        PrivacySettings = PrivacySettings.Create(
            isProfilePublic,
            shareMoodData,
            allowAIAnalysis
        );
    }

    public void UpdateBirthInfo(BirthInfo birthInfo)
    {
        ArgumentNullException.ThrowIfNull(birthInfo);
        BirthInfo = birthInfo;
    }

    public void GrantConsent(ConsentType type)
    {
        if (_consents.Any(c => c.Type == type))
            return;

        _consents.Add(new UserConsent(type, this.Id));
    }

    public void RevokeConsent(ConsentType type)
    {
        var existing = _consents.FirstOrDefault(c => c.Type == type);
        if (existing is not null)
            _consents.Remove(existing);
    }

    public void SetPasswordHash(string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(passwordHash))
            throw new ArgumentException("Password hash is required.");

        PasswordHash = passwordHash;
        PasswordChangedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Ertelenmiş hesap silme: oturumlar kapanır; veriler <paramref name="gracePeriod"/> sonunda kalıcı silinir.
    /// </summary>
    public void RequestScheduledDeletion(TimeSpan gracePeriod)
    {
        if (gracePeriod <= TimeSpan.Zero)
            throw new ArgumentOutOfRangeException(nameof(gracePeriod));

        if (!IsActive)
            throw new InvalidOperationException("Hesap zaten devre dışı.");

        if (ScheduledHardDeletionAtUtc.HasValue)
            throw new InvalidOperationException("Hesap silme talebi zaten işleniyor.");

        var now = DateTime.UtcNow;
        AccountDeletionRequestedAtUtc = now;
        ScheduledHardDeletionAtUtc = now.Add(gracePeriod);
        IsActive = false;
    }

}
