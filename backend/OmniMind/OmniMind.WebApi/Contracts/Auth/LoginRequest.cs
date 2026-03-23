namespace OmniMind.WebApi.Contracts.Auth;

public class LoginRequest
{
    public string Login { get; set; } = default!;
    public string Password { get; set; } = default!;
}
