using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using OmniMind.WebApi.Abstractions;
using OmniMind.WebApi.Contracts.Account;
using OmniMind.WebApi.Services.Auth;

namespace OmniMind.WebApi.Controllers;

[Authorize]
public class AccountController : ApiController
{
    private readonly IAuthService _authService;

    public AccountController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost]
    [EnableRateLimiting("account-delete")]
    public async Task<ActionResult<RequestAccountDeletionResponse>> RequestDeletion(
        [FromBody] RequestAccountDeletionRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _authService.RequestScheduledAccountDeletionAsync(
            userId,
            request.Password,
            cancellationToken);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<AccountPreferencesResponse>> MyPreferences(
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var dto = await _authService.GetAccountPreferencesAsync(userId, cancellationToken);
        return Ok(dto);
    }

    [HttpPut]
    public async Task<ActionResult> UpdatePreferences(
        [FromBody] UpdateAccountPreferencesRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        await _authService.UpdateAccountPreferencesAsync(userId, request, cancellationToken);
        return Ok();
    }

    private Guid GetUserId()
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                  ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(sub) || !Guid.TryParse(sub, out var id))
            throw new InvalidOperationException("Geçersiz kullanıcı kimliği.");
        return id;
    }
}
