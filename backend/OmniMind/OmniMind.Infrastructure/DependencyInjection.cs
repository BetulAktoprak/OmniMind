using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using OmniMind.Application.Abstractions;
using OmniMind.Infrastructure.AI;
using OmniMind.Infrastructure.Security;
using System.Net.Http.Headers;

namespace OmniMind.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<OpenAiOptions>(configuration.GetSection(OpenAiOptions.SectionName));

        services.AddHttpClient<IJournalInsightService, OpenAiJournalInsightService>((sp, client) =>
        {
            var o = sp.GetRequiredService<IOptions<OpenAiOptions>>().Value;
            var baseUrl = string.IsNullOrWhiteSpace(o.BaseUrl)
                ? "https://api.openai.com/v1"
                : o.BaseUrl.TrimEnd('/');
            client.BaseAddress = new Uri(baseUrl + "/");
            client.Timeout = TimeSpan.FromSeconds(90);
            if (!string.IsNullOrWhiteSpace(o.ApiKey))
                client.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", o.ApiKey.Trim());
        });

        services.AddScoped<IContentEncryptionService, ContentEncryptionService>();
        return services;
    }
}
