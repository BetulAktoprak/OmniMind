using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using OmniMind.Infrastructure.Persistence.Context;

namespace OmniMind.WebApi.Middlewares;

/// <summary>
/// JWT süresi dolana kadar geçerli kalabileceği için, devre dışı / silinme sürecindeki kullanıcıların API erişimini keser.
/// </summary>
public sealed class RequireActiveUserMiddleware
{
    private readonly RequestDelegate _next;

    public RequireActiveUserMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IServiceScopeFactory scopeFactory)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var sub = context.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                      ?? context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(sub, out var userId))
            {
                using var scope = scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<OmniMindDbContext>();
                var active = await db.Users.AnyAsync(
                    u => u.Id == userId && u.IsActive,
                    context.RequestAborted);

                if (!active)
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsJsonAsync(
                        new
                        {
                            message =
                                "Hesabınız kapalı veya silinme sürecinde. Lütfen tekrar giriş yapın."
                        },
                        context.RequestAborted);
                    return;
                }
            }
        }

        await _next(context);
    }
}
