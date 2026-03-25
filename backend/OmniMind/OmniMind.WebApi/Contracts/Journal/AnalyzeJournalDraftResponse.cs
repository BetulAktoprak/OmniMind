namespace OmniMind.WebApi.Contracts.Journal;

public sealed class AnalyzeJournalDraftResponse
{
    public string Comment { get; set; } = string.Empty;
    public string MusicSuggestion { get; set; } = string.Empty;
}
