namespace OmniMind.Application.Features.Journal.Dtos;

public sealed record JournalListItemDto(
    Guid Id,
    string? Title,
    string? Mood,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed record JournalDetailDto(
    Guid Id,
    string? Title,
    string? Mood,
    string Body,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    string? AiComment,
    string? AiMusicSuggestion,
    DateTime? AiInsightGeneratedAt);

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);
