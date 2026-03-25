namespace OmniMind.Infrastructure.AI;

/// <summary>
/// OpenAI uyumlu <c>chat/completions</c> uç noktası. OpenAI veya Groq vb. aynı alanlarla yapılandırılır.
/// </summary>
public sealed class OpenAiOptions
{
    public const string SectionName = "OpenAI";

    /// <summary>OpenAI, Groq (gsk_...) veya başka uyumlu sağlayıcı anahtarı.</summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>OpenAI: gpt-4o-mini. Groq: llama-3.3-70b-versatile, llama-3.1-8b-instant, …</summary>
    public string Model { get; set; } = "gpt-4o-mini";

    /// <summary>OpenAI: https://api.openai.com/v1 — Groq: https://api.groq.com/openai/v1</summary>
    public string BaseUrl { get; set; } = "https://api.openai.com/v1";
}
