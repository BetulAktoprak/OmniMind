namespace OmniMind.WebApi.Contracts.Journal;

public sealed class UpdateJournalRequest
{
    public string? Title { get; set; }
    public string? Mood { get; set; }
    public string Body { get; set; } = "";
}
