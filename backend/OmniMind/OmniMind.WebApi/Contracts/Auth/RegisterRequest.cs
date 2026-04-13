using System.ComponentModel.DataAnnotations;
using OmniMind.Domain.Identity;

namespace OmniMind.WebApi.Contracts.Auth;

public class RegisterRequest
{
    [Required, EmailAddress, StringLength(256)]
    public string Email { get; set; } = default!;

    [Required, StringLength(100, MinimumLength = 2)]
    public string Username { get; set; } = default!;

    [Required, StringLength(128, MinimumLength = 8)]
    public string Password { get; set; } = default!;

    [StringLength(200)]
    public string? DisplayName { get; set; }

    //Consent tipleri (int) gönderilebilir
    public List<ConsentType>? Consents { get; set; }

}
