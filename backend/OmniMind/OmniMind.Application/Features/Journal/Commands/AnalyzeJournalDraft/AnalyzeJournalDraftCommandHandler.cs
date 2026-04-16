using System.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using OmniMind.Application.Abstractions;
using OmniMind.Application.Common.Exceptions;
using OmniMind.Application.Features.Journal.Options;
using OmniMind.Domain.Journal;

namespace OmniMind.Application.Features.Journal.Commands.AnalyzeJournalDraft;

public sealed class AnalyzeJournalDraftCommandHandler
    : IRequestHandler<AnalyzeJournalDraftCommand, JournalDraftInsight>
{
    private const int MinLength = 10;
    private const int MaxLength = 12_000;

    private readonly IApplicationDbContext _db;
    private readonly IJournalInsightService _insight;
    private readonly int _dailyLimit;

    public AnalyzeJournalDraftCommandHandler(
        IApplicationDbContext db,
        IJournalInsightService insight,
        IOptions<JournalAiRateLimitOptions> rateOptions)
    {
        _db = db;
        _insight = insight;
        _dailyLimit = Math.Max(1, rateOptions.Value.DailyAnalyzeDraftLimit);
    }

    public async Task<JournalDraftInsight> Handle(
        AnalyzeJournalDraftCommand request,
        CancellationToken cancellationToken)
    {
        var text = request.Body?.Trim() ?? string.Empty;
        if (text.Length < MinLength)
            throw new ArgumentException($"Günlük metni en az {MinLength} karakter olmalıdır.");
        if (text.Length > MaxLength)
            throw new ArgumentException($"Günlük metni en fazla {MaxLength} karakter olabilir.");

        await _db.EnsureUserExistsAsync(request.UserId, cancellationToken);

        var allowAi = await _db.Users
            .AsNoTracking()
            .Where(u => u.Id == request.UserId)
            .Select(u => u.PrivacySettings.AllowAIAnalysis)
            .FirstAsync(cancellationToken);

        if (!allowAi)
            throw new InvalidOperationException(
                "Yapay zeka ile günlük analizi kapalı. Ayarlardan izin verebilirsin.");

        await ConsumeDailyQuotaAsync(request.UserId, cancellationToken);

        try
        {
            return await _insight.AnalyzeDraftAsync(text, request.Mood, cancellationToken);
        }
        catch (HttpRequestException ex)
        {
            throw new ExternalServiceException(
                "Yapay zeka servisine şu an ulaşılamıyor. Lütfen daha sonra tekrar deneyin.", ex);
        }
        catch (TaskCanceledException ex) when (!cancellationToken.IsCancellationRequested)
        {
            throw new ExternalServiceException("Yapay zeka yanıtı zaman aşımına uğradı.", ex);
        }
    }

    private async Task ConsumeDailyQuotaAsync(Guid userId, CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        await using var tx = await _db.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);
        try
        {
            var row = await _db.JournalAiDailyUsages
                .FirstOrDefaultAsync(
                    x => x.UserId == userId && x.UtcDate == today,
                    cancellationToken);

            if (row is null)
                _db.JournalAiDailyUsages.Add(JournalAiDailyUsage.CreateFirst(userId, today));
            else if (!row.TryIncrement(_dailyLimit))
                throw new RateLimitExceededException(
                    $"Günlük yorum limitine ulaştınız (günde en fazla {_dailyLimit} istek). Yarın (UTC) tekrar deneyin.");

            await _db.SaveChangesAsync(cancellationToken);
            await tx.CommitAsync(cancellationToken);
        }
        catch
        {
            await tx.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
