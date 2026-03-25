using System.Net;
using System.Text.Json;
using OmniMind.Application.Common.Exceptions;

namespace OmniMind.WebApi.Middlewares;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionMiddleware(RequestDelegate next)
    {
        _next = next;
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
                NotFoundException => (HttpStatusCode.NotFound, ex.Message),
                RateLimitExceededException => (HttpStatusCode.TooManyRequests, ex.Message),
                ExternalServiceException => (HttpStatusCode.ServiceUnavailable, ex.Message),
                ArgumentException => (HttpStatusCode.BadRequest, ex.Message),
                InvalidOperationException => (HttpStatusCode.BadRequest, ex.Message),
                _ => (HttpStatusCode.BadRequest, ex.Message)
            };

            context.Response.StatusCode = (int)status;
            var payload = new { message };
            await context.Response.WriteAsync(JsonSerializer.Serialize(payload));
        }
    }
}
