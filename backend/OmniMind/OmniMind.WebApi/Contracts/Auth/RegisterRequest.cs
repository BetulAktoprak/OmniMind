using OmniMind.Domain.Identity;

namespace OmniMind.WebApi.Contracts.Auth;

public class RegisterRequest
{
    public string Email { get; set; } = default!;
    public string Username { get; set; } = default!;
    public string Password { get; set; } = default!;

    public string? DisplayName { get; set; }

    //Consent tipleri (int) gönderilebilir
    public List<ConsentType>? Consents { get; set; }

}
