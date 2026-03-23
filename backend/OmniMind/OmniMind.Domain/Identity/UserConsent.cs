using OmniMind.Domain.Common;

namespace OmniMind.Domain.Identity;
public class UserConsent : BaseEntity
{
    public ConsentType Type { get; private set; }
    public DateTime GrantedAt { get; private set; }
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;

    private UserConsent() { }

    public UserConsent(ConsentType type, Guid userId)
    {
        Id = Guid.NewGuid();
        Type = type;
        GrantedAt = DateTime.UtcNow;
        UserId = userId;
    }
}
