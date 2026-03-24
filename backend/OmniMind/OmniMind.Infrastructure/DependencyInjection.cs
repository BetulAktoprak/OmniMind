using Microsoft.Extensions.DependencyInjection;
using OmniMind.Application.Abstractions;
using OmniMind.Infrastructure.Security;

namespace OmniMind.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services)
    {
        services.AddScoped<IContentEncryptionService, ContentEncryptionService>();
        return services;
    }
}
