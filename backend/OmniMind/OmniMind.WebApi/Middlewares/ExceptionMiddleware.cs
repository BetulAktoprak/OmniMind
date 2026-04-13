using System.Net;
using System.Text.Json;
using OmniMind.Application.Common.Exceptions;

namespace OmniMind.WebApi.Middlewares;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            context.Response.ContentType = "application/json";
            var (status, message) = ex switch
            {
                UnauthorizedSessionException => (HttpStatusCode.Unauthorized, ex.Message),
                NotFoundException => (HttpStatusCode.NotFound, ex.Message),
                RateLimitExceededException => (HttpStatusCode.TooManyRequests, ex.Message),
                ExternalServiceException => (HttpStatusCode.ServiceUnavailable, ex.Message),
                ArgumentException => (HttpStatusCode.BadRequest, ex.Message),
                InvalidOperationException => (HttpStatusCode.BadRequest, ex.Message),
                _ => (HttpStatusCode.InternalServerError, (string?)null)
            };

            if (status == HttpStatusCode.InternalServerError)
            {
                _logger.LogError(ex, "İşlenmeyen sunucu hatası.");
                message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
            }

            context.Response.StatusCode = (int)status;
            var payload = new { message };
            await context.Response.WriteAsync(JsonSerializer.Serialize(payload));
        }
    }
}
