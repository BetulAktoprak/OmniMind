using MediatR;
using OmniMind.Application.Features.Journal.Dtos;

namespace OmniMind.Application.Features.Journal.Commands.UpdateJournalEntry;

public sealed record UpdateJournalEntryCommand(
    Guid UserId,
    Guid JournalId,
    string? Title,
    string? Mood,
    string Body,
    JournalInsightInput? AiInsight) : IRequest<Unit>;
