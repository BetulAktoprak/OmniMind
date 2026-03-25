namespace OmniMind.Domain.Journal;

/// <summary>Kullanıcı başına UTC günü bazında günlük yorum (AnalyzeDraft) istek sayısı.</summary>
public class JournalAiDailyUsage
{
    public Guid UserId { get; private set; }
    public DateOnly UtcDate { get; private set; }
    public int RequestCount { get; private set; }

    private JournalAiDailyUsage() { }

    public static JournalAiDailyUsage CreateFirst(Guid userId, DateOnly utcDate) =>
        new()
        {
            UserId = userId,
            UtcDate = utcDate,
            RequestCount = 1,
        };

    /// <summary>Limit dolmuşsa false.</summary>
    public bool TryIncrement(int maxPerDay)
    {
        if (RequestCount >= maxPerDay)
            return false;
        RequestCount++;
        return true;
    }
}
