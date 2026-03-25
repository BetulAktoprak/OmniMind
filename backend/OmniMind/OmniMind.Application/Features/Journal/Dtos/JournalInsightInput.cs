namespace OmniMind.Application.Features.Journal.Dtos;

/// <summary>Oluşturma/güncellemede isteğe bağlı; null ise mevcut yorum alanları değişmez (güncellemede).</summary>
public sealed record JournalInsightInput(string? Comment, string? MusicSuggestion);
