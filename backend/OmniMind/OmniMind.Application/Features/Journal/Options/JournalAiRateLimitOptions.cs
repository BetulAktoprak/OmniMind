namespace OmniMind.Application.Features.Journal.Options;

public sealed class JournalAiRateLimitOptions
{
    public const string SectionName = "JournalAi";

    /// <summary>Kayıtlı kullanıcı başına UTC gününde en fazla AnalyzeDraft isteği.</summary>
    public int DailyAnalyzeDraftLimit { get; set; } = 15;
}
