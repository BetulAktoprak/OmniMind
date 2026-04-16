using System.ComponentModel.DataAnnotations;
using OmniMind.Domain.Identity;

namespace OmniMind.WebApi.Contracts.Auth;

public class RegisterRequest
{
    [Required(ErrorMessage = "E-posta gereklidir.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi girin.")]
    [StringLength(256, ErrorMessage = "E-posta en fazla 256 karakter olabilir.")]
    public string Email { get; set; } = default!;

    [Required(ErrorMessage = "Kullanıcı adı gereklidir.")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Kullanıcı adı en az 3 karakter olmalıdır.")]
    public string Username { get; set; } = default!;

    [Required(ErrorMessage = "Şifre gereklidir.")]
    [StringLength(128, MinimumLength = 8, ErrorMessage = "Şifre geçerli değil. En az 8 karakter girmelisin.")]
    public string Password { get; set; } = default!;

    [StringLength(200, ErrorMessage = "Görünen ad çok uzun.")]
    public string? DisplayName { get; set; }

    //Consent tipleri (int) gönderilebilir
    public List<ConsentType>? Consents { get; set; }

}
