using MediatR;
using OmniMind.Application.Features.Journal.Dtos;

namespace OmniMind.Application.Features.Journal.Commands.CreateJournalEntry;

public sealed record CreateJournalEntryCommand(
    Guid UserId,
    string? Title,
    string? Mood,
    string Body,
    JournalInsightInput? AiInsight) : IRequest<Guid>;
