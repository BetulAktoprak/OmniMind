namespace OmniMind.Application.Abstractions;

public sealed record JournalDraftInsight(string Comment, string MusicSuggestion);

public interface IJournalInsightService
{
    Task<JournalDraftInsight> AnalyzeDraftAsync(
        string journalText,
        string? mood,
        CancellationToken cancellationToken = default);
}
