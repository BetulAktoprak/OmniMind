using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
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

    private const string UserFacingGeneric =
        "Yapay zeka yorumu şu an alınamadı. Lütfen bir süre sonra tekrar deneyin.";

    private readonly HttpClient _http;
    private readonly OpenAiOptions _options;
    private readonly ILogger<OpenAiJournalInsightService> _logger;

    public OpenAiJournalInsightService(
        HttpClient http,
        IOptions<OpenAiOptions> options,
        ILogger<OpenAiJournalInsightService> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<JournalDraftInsight> AnalyzeDraftAsync(
        string journalText,
        string? mood,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            _logger.LogError("Journal LLM: OpenAI:ApiKey is empty; configure OpenAI__ApiKey on the host.");
            throw new ExternalServiceException(UserFacingGeneric);
        }

        var systemPrompt =
            """
            Sen OmniMind’ta kullanıcının en yakın arkadaşısın: sıcak, samimi ve zaman zaman esprili; yan yana oturup sohbet ediyormuşsun gibi konuş.
            Kullanıcı günlük yazmış; tıbbi teşhis veya tedavi önerisi verme.

            Dil (mutlak):
            - "comment" tamamen Türkçe olmalı; İngilizce vb. kelime yazma (kullanıcı metninde geçse bile cevabın Türkçe).
            - "musicSuggestion" tek istisna: yalnızca tek satır, gerçek bir kayıt formatında "Sanatçı veya Grup - Şarkı adı" (ör. Daft Punk - Instant Crush). Sanatçı/şarkı adı gerçek yazımıyla; tür tarifi, uzun cümle, tırnak veya ek açıklama yok. Türkçe şarkılarda yine aynı format.
            - CamelCase, bozuk birleşik kelime, anlamsız token üretme; comment için normal Türkçe yazım kullan.

            Arkadaş üslubu:
            - Yalnızca "sen" dili; "siz", "dilerim", "kutluyorum", "tebrikler" gibi resmi veya törensel kalıplar yok.
            - Günlükte geçen somut şeylere tut (kim, ne yapıyorsun, ne yemek, nereye gidiş vb.); genel nasihat veya şablon cümlelerden kaçın.
            - "Mutlaka", "kesinlikle", "herhalde seviyorsundur" gibi tekrarlı veya tahminvari doldurma yazma; gerçekten dinliyormuşsun gibi kısa tepki ver.
            - Hafif espri, oyunlu bir laf veya kıvırcık bir gönderme kullanabilirsin; kırıcı alay, aşağılama, kinayeli sertlik veya kullanıcıyı küçümseyen şaka yok.
            - Metin çok üzgün, kayıp, korku veya ciddi kriz tonundaysa espriyi zorlama; o zaman sadece sıcak ve yanındaymış gibi ol.
            - Kapanışta "güzel gün geçirin" tarzı genel dilekler yerine, yazdığı ana konuya bağlı doğal bir cümleyle bitir.
            - Türkçede doğal kısaltmalar olabilir ("bi", "şey") ama yabancı dil serpiştirme.

            Yanıtın YALNIZCA geçerli bir JSON nesnesi olsun, başka metin ekleme.
            Şema: {"comment":"...", "musicSuggestion":"..."}
            - comment: 2-4 kısa cümle; mesajlaşıyormuşsun gibi akıcı; uygunsa bi cümlede hafif espri.
            - musicSuggestion: tek satır "Sanatçı - Şarkı"; bilinen, dinlenebilir bir parça seç (uydurma başlık yok).
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
            Temperature = 0.62f,
            MaxTokens = 500,
        };

        using var response = await _http.PostAsJsonAsync("chat/completions", req, JsonOpts, cancellationToken);
        var raw = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            LogProviderFailure(response.StatusCode, raw);

            var msg = response.StatusCode switch
            {
                HttpStatusCode.TooManyRequests =>
                    "Çok sık istek gönderildi veya günlük kota doldu. Lütfen bir süre sonra tekrar deneyin.",
                HttpStatusCode.Unauthorized =>
                    UserFacingGeneric,
                HttpStatusCode.PaymentRequired =>
                    "Yapay zeka servisi hesap veya kota nedeniyle isteği reddetti. Lütfen daha sonra tekrar deneyin.",
                _ => UserFacingGeneric,
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

    private void LogProviderFailure(HttpStatusCode status, string raw)
    {
        // 401 yanıt gövdesi sağlayıcıdan anahtar parçaları içerebilir; loglamayın.
        if (status == HttpStatusCode.Unauthorized)
        {
            _logger.LogWarning(
                "Journal LLM provider returned 401. Check OpenAI__ApiKey and OpenAI__BaseUrl (e.g. Groq needs https://api.groq.com/openai/v1).");
            return;
        }

        var detail = TryExtractOpenAiErrorMessage(raw);
        if (detail != null)
            _logger.LogWarning("Journal LLM provider error {Status}: {Detail}", (int)status, detail);
        else
            _logger.LogWarning("Journal LLM provider error {Status}, body length {Length}.", (int)status, raw.Length);
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
