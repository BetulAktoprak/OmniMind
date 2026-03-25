namespace OmniMind.WebApi.Contracts.Journal;

public sealed class AnalyzeJournalDraftRequest
{
    public string Body { get; set; } = string.Empty;
    public string? Mood { get; set; }
}
