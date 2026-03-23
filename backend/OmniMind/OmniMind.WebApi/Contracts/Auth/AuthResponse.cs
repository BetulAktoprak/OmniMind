namespace OmniMind.WebApi.Contracts.Auth;

public class AuthResponse
{
    public string AccessToken { get; set; } = default!;
    public DateTime ExpiresAt { get; set; }

    public Guid UserId { get; set; }
    public string Email { get; set; } = default!;
    public string Username { get; set; } = default!;
}
