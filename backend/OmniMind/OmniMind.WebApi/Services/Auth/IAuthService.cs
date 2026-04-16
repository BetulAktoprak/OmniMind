using OmniMind.WebApi.Contracts.Account;
using OmniMind.WebApi.Contracts.Auth;

namespace OmniMind.WebApi.Services.Auth;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task<RequestAccountDeletionResponse> RequestScheduledAccountDeletionAsync(
        Guid userId,
        string password,
        CancellationToken cancellationToken);

    Task<AccountPreferencesResponse> GetAccountPreferencesAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task UpdateAccountPreferencesAsync(
        Guid userId,
        UpdateAccountPreferencesRequest request,
        CancellationToken cancellationToken);
}
