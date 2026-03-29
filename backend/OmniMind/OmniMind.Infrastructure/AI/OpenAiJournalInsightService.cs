using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using OmniMind.Application.Abstractions;
using OmniMind.Application.Common.Exceptions;

namespace OmniMind.Infrastructure.AI;

public sealed class OpenAiJournalInsightService : IJournalInsightService
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    private readonly HttpClient _http;
    private readonly OpenAiOptions _options;

    public OpenAiJournalInsightService(HttpClient http, IOptions<OpenAiOptions> options)
    {
        _http = http;
        _options = options.Value;
    }

    public async Task<JournalDraftInsight> AnalyzeDraftAsync(
        string journalText,
        string? mood,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
            throw new ExternalServiceException(
                "Yapay zeka API anahtarı yapılandırılmamış. User secrets veya ortamda OpenAI:ApiKey (Groq için gsk_...) tanımlayın.");

        var systemPrompt =
            """
            Sen OmniMind’ta kullanıcının yakın bir arkadaşı gibi konuşan, sıcak ve samimi bir yanıtsın.
            Kullanıcı günlük yazmış; tıbbi teşhis veya tedavi önerisi verme.

            Dil (mutlak):
            - "comment" ve "musicSuggestion" metinleri yüzde yüz Türkçe olmalı. İngilizce, İspanyolca, Almanca vb. kelime yazma.
            - Kullanıcı metinde yabancı kelime geçse bile senin cevabın tamamen Türkçe olsun (ör. "energy" yerine "enerji", "really" yerine "gerçekten").
            - CamelCase, bozuk birleşik kelime, anlamsız token (ör. mutluThings) üretme; normal Türkçe yazım kullan.

            Üslup:
            - Yalnızca "sen" dili; "siz", "dilerim", "kutluyorum" gibi resmi kalıplar yok.
            - Kısa, günlük konuşma; abartılı övgü veya kurumsal nezaket yok; yargılama.
            - Türkçede doğal kısaltmalar olabilir ("bi", "şey") ama yabancı dil serpiştirme.

            Yanıtın YALNIZCA geçerli bir JSON nesnesi olsun, başka metin ekleme.
            Şema: {"comment":"...", "musicSuggestion":"..."}
            - comment: 2-4 kısa cümle, samimi "sen" dili.
            - musicSuggestion: 1-2 cümle; müzik türünü Türkçe anlat (ör. hafif enstrümantal, neşeli pop, sakin akustik). Şarkı/şarkıcı adı zorunlu değil.
            """;

        var userBlock = mood != null
            ? $"Kullanıcının seçtiği ruh hali etiketi: {mood}\n\nGünlük metni:\n{journalText}"
            : $"Günlük metni:\n{journalText}";

        var req = new ChatCompletionRequest
        {
            Model = _options.Model,
            Messages =
            [
                new ChatMessage { Role = "system", Content = systemPrompt },
                new ChatMessage { Role = "user", Content = userBlock },
            ],
            ResponseFormat = new ResponseFormat { Type = "json_object" },
            Temperature = 0.35f,
            MaxTokens = 500,
        };

        using var response = await _http.PostAsJsonAsync("chat/completions", req, JsonOpts, cancellationToken);
        var raw = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var openAiDetail = TryExtractOpenAiErrorMessage(raw);
            var msg = response.StatusCode switch
            {
                HttpStatusCode.TooManyRequests =>
                    "LLM sağlayıcısı isteği kabul etmedi (429: çok sık istek veya kota). "
                    + "Birkaç dakika sonra tekrar deneyin; OpenAI: platform.openai.com — Groq: console.groq.com Usage/Limits."
                    + (openAiDetail != null ? $" Detay: {openAiDetail}" : ""),
                HttpStatusCode.Unauthorized =>
                    "API anahtarı geçersiz veya yetkisiz (401). Anahtarı ve BaseUrl / model adını kontrol edin."
                    + (openAiDetail != null ? $" {openAiDetail}" : ""),
                HttpStatusCode.PaymentRequired =>
                    "Sağlayıcı ödeme veya kota nedeniyle isteği reddetti. Hesap ve faturalandırmayı kontrol edin."
                    + (openAiDetail != null ? $" {openAiDetail}" : ""),
                _ =>
                    $"Yapay zeka servisi hata döndü ({(int)response.StatusCode})."
                    + (openAiDetail != null ? $" {openAiDetail}" : ""),
            };
            throw new ExternalServiceException(msg);
        }

        ChatCompletionResponse? parsed;
        try
        {
            parsed = JsonSerializer.Deserialize<ChatCompletionResponse>(raw, JsonOpts);
        }
        catch (JsonException)
        {
            throw new ExternalServiceException("Yapay zeka yanıtı okunamadı.");
        }

        var content = parsed?.Choices?.FirstOrDefault()?.Message?.Content;
        if (string.IsNullOrWhiteSpace(content))
            throw new ExternalServiceException("Yapay zeka boş yanıt döndü.");

        InsightJson? insight;
        try
        {
            insight = JsonSerializer.Deserialize<InsightJson>(content, JsonOpts);
        }
        catch (JsonException)
        {
            throw new ExternalServiceException("Yapay zeka JSON çıktısı çözülemedi.");
        }

        var comment = insight?.Comment?.Trim();
        var music = insight?.MusicSuggestion?.Trim();
        if (string.IsNullOrEmpty(comment) || string.IsNullOrEmpty(music))
            throw new ExternalServiceException("Yapay zeka eksik alan döndürdü.");

        return new JournalDraftInsight(comment, music);
    }

    private static string? TryExtractOpenAiErrorMessage(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;
        try
        {
            using var doc = JsonDocument.Parse(raw);
            if (doc.RootElement.TryGetProperty("error", out var err) &&
                err.TryGetProperty("message", out var m))
                return m.GetString();
        }
        catch (JsonException)
        {
            // yoksay
        }

        return null;
    }

    private sealed class ChatCompletionRequest
    {
        public string Model { get; set; } = "";
        public List<ChatMessage> Messages { get; set; } = [];
        [JsonPropertyName("response_format")]
        public ResponseFormat? ResponseFormat { get; set; }
        public float Temperature { get; set; }
        [JsonPropertyName("max_tokens")]
        public int MaxTokens { get; set; }
    }

    private sealed class ChatMessage
    {
        public string Role { get; set; } = "";
        public string Content { get; set; } = "";
    }

    private sealed class ResponseFormat
    {
        public string Type { get; set; } = "json_object";
    }

    private sealed class ChatCompletionResponse
    {
        public List<Choice>? Choices { get; set; }
    }

    private sealed class Choice
    {
        public ChoiceMessage? Message { get; set; }
    }

    private sealed class ChoiceMessage
    {
        public string? Content { get; set; }
    }

    private sealed class InsightJson
    {
        public string? Comment { get; set; }
        [JsonPropertyName("musicSuggestion")]
        public string? MusicSuggestion { get; set; }
    }
}
