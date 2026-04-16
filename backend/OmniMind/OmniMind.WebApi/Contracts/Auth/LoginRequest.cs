using System.ComponentModel.DataAnnotations;

namespace OmniMind.WebApi.Contracts.Auth;

public class LoginRequest
{
    [Required(ErrorMessage = "E-posta veya kullanıcı adı gereklidir.")]
    [StringLength(256, ErrorMessage = "Giriş bilgisi çok uzun.")]
    public string Login { get; set; } = default!;

    [Required(ErrorMessage = "Şifre gereklidir.")]
    [StringLength(512, ErrorMessage = "Şifre çok uzun.")]
    public string Password { get; set; } = default!;
}
