using MediatR;

namespace OmniMind.Application.Features.Journal.Commands.DeleteJournalEntry;

public sealed record DeleteJournalEntryCommand(Guid UserId, Guid JournalId) : IRequest<Unit>;
