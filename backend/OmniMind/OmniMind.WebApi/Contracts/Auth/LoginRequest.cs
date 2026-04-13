using System.ComponentModel.DataAnnotations;

namespace OmniMind.WebApi.Contracts.Auth;

public class LoginRequest
{
    [Required, StringLength(256)]
    public string Login { get; set; } = default!;

    [Required, StringLength(512)]
    public string Password { get; set; } = default!;
}
