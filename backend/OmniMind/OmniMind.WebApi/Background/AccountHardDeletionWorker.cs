using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OmniMind.Infrastructure.Persistence.Context;

namespace OmniMind.WebApi.Background;

/// <summary>
/// Planlanan tarihi geçen kullanıcıları ve ilişkili verileri (cascade) kalıcı olarak siler.
/// </summary>
public sealed class AccountHardDeletionWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AccountHardDeletionWorker> _logger;

    public AccountHardDeletionWorker(
        IServiceScopeFactory scopeFactory,
        ILogger<AccountHardDeletionWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // İlk çalıştırmada kısa gecikme (API ayağa kalksın)
        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await PurgeDueUsersAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Hesap kalıcı silme işi hata verdi.");
            }

            try
            {
                await Task.Delay(TimeSpan.FromHours(6), stoppingToken);
            }
            catch (TaskCanceledException)
            {
                break;
            }
        }
    }

    private async Task PurgeDueUsersAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<OmniMindDbContext>();
        var now = DateTime.UtcNow;

        var due = await db.Users
            .Where(u => u.ScheduledHardDeletionAtUtc != null && u.ScheduledHardDeletionAtUtc <= now)
            .ToListAsync(ct);

        if (due.Count == 0)
            return;

        db.Users.RemoveRange(due);
        await db.SaveChangesAsync(ct);
        _logger.LogInformation("{Count} kullanıcı ve ilişkili veriler kalıcı olarak silindi.", due.Count);
    }
}
