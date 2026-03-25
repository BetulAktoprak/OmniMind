namespace OmniMind.WebApi.Contracts.Journal;

public sealed class UpdateJournalRequest
{
    public string? Title { get; set; }
    public string? Mood { get; set; }
    public string Body { get; set; } = "";

    /// <summary>Null ise mevcut yorumlar değişmez; gönderilirse alanlar güncellenir.</summary>
    public JournalInsightPayload? Insight { get; set; }
}
