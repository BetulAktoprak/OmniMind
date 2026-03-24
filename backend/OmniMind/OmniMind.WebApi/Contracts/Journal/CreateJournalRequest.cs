namespace OmniMind.WebApi.Contracts.Journal;

public sealed class CreateJournalRequest
{
    public string? Title { get; set; }
    public string? Mood { get; set; }
    public string Body { get; set; } = "";
}
