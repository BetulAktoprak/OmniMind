using Microsoft.AspNetCore.Mvc;
using OmniMind.WebApi.Abstractions;
using OmniMind.WebApi.Contracts.Auth;
using OmniMind.WebApi.Services.Auth;

namespace OmniMind.WebApi.Controllers;

public class AuthController : ApiController
{
    private readonly IAuthService _authService;
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        var response = await _authService.RegisterAsync(request, cancellationToken);
        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var response = await _authService.LoginAsync(request, cancellationToken);
        return Ok(response);
    }

}
