using MediatR;

namespace OmniMind.Application.Features.Journal.Commands.CreateJournalEntry;

public sealed record CreateJournalEntryCommand(
    Guid UserId,
    string? Title,
    string? Mood,
    string Body) : IRequest<Guid>;
