using OmniMind.Domain.Common;

namespace OmniMind.Domain.Identity;
public class Profile : BaseEntity
{
    public string? DisplayName { get; private set; }
    public string? Bio { get; private set; }
    public string? AvatarUrl { get; private set; }

    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;

    private Profile() { }

    internal Profile(User user)
    {
        Id = Guid.NewGuid();
        User = user;
        UserId = user.Id;
    }

    public void Update(string? displayName, string? bio, string? avatarUrl)
    {
        DisplayName = displayName;
        Bio = bio;
        AvatarUrl = avatarUrl;
    }
}
