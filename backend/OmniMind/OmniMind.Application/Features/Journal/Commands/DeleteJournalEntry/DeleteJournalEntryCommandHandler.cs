using MediatR;
using Microsoft.EntityFrameworkCore;
using OmniMind.Application.Abstractions;
using OmniMind.Application.Common.Exceptions;

namespace OmniMind.Application.Features.Journal.Commands.DeleteJournalEntry;

public sealed class DeleteJournalEntryCommandHandler : IRequestHandler<DeleteJournalEntryCommand, Unit>
{
    private readonly IApplicationDbContext _db;

    public DeleteJournalEntryCommandHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(DeleteJournalEntryCommand request, CancellationToken cancellationToken)
    {
        var entry = await _db.JournalEntries
            .FirstOrDefaultAsync(
                j => j.Id == request.JournalId && j.UserId == request.UserId && !j.IsDeleted,
                cancellationToken);

        if (entry is null)
            throw new NotFoundException("Günlük bulunamadı.");

        entry.SoftDelete();
        await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
