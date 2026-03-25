using OmniMind.Domain.Common;

namespace OmniMind.Domain.Journal;

public class JournalEntry : BaseEntity
{
    public Guid UserId { get; private set; }
    /// <summary>Liste önizlemesi için düz metin (şifrelenmez).</summary>
    public string? Title { get; private set; }
    public string? Mood { get; private set; }
    /// <summary>AES-GCM: 12 bayt nonce + şifreli gövde + 16 bayt etiket.</summary>
    public byte[] EncryptedContent { get; private set; } = default!;
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTime? DeletedAt { get; private set; }

    /// <summary>LLM yorumu (düz metin).</summary>
    public string? AiComment { get; private set; }

    /// <summary>LLM müzik önerisi (düz metin).</summary>
    public string? AiMusicSuggestion { get; private set; }

    public DateTime? AiInsightGeneratedAt { get; private set; }

    private JournalEntry() { }

    public static JournalEntry Create(
        Guid userId,
        string? title,
        string? mood,
        byte[] encryptedContent)
    {
        ArgumentNullException.ThrowIfNull(encryptedContent);
        if (encryptedContent.Length < 12 + 16)
            throw new ArgumentException("Encrypted content blob is invalid.", nameof(encryptedContent));

        var now = DateTime.UtcNow;
        return new JournalEntry
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = NormalizeTitle(title),
            Mood = NormalizeMood(mood),
            EncryptedContent = encryptedContent,
            CreatedAt = now,
            UpdatedAt = now,
            IsDeleted = false
        };
    }

    public void Update(string? title, string? mood, byte[] encryptedContent)
    {
        ArgumentNullException.ThrowIfNull(encryptedContent);
        if (encryptedContent.Length < 12 + 16)
            throw new ArgumentException("Encrypted content blob is invalid.", nameof(encryptedContent));

        Title = NormalizeTitle(title);
        Mood = NormalizeMood(mood);
        EncryptedContent = encryptedContent;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetAiInsight(string? comment, string? music)
    {
        AiComment = NormalizeAi(comment, 8000);
        AiMusicSuggestion = NormalizeAi(music, 4000);
        AiInsightGeneratedAt = AiComment != null || AiMusicSuggestion != null
            ? DateTime.UtcNow
            : null;
    }

    public void SoftDelete()
    {
        if (IsDeleted) return;
        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    private static string? NormalizeTitle(string? title)
    {
        if (string.IsNullOrWhiteSpace(title)) return null;
        var t = title.Trim();
        return t.Length > 200 ? t[..200] : t;
    }

    private static string? NormalizeMood(string? mood)
    {
        if (string.IsNullOrWhiteSpace(mood)) return null;
        var m = mood.Trim();
        return m.Length > 64 ? m[..64] : m;
    }

    private static string? NormalizeAi(string? text, int maxLen)
    {
        if (string.IsNullOrWhiteSpace(text)) return null;
        var s = text.Trim();
        return s.Length > maxLen ? s[..maxLen] : s;
    }
}
