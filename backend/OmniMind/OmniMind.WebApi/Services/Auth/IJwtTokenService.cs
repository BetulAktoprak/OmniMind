using OmniMind.Domain.Identity;

namespace OmniMind.WebApi.Services.Auth;

public interface IJwtTokenService
{
    (string token, DateTime expiresAt) CreateToken(User user);
}
