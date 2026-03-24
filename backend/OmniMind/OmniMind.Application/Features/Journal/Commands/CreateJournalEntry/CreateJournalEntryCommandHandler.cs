using MediatR;
using OmniMind.Application.Abstractions;
using OmniMind.Domain.Journal;

namespace OmniMind.Application.Features.Journal.Commands.CreateJournalEntry;

public sealed class CreateJournalEntryCommandHandler : IRequestHandler<CreateJournalEntryCommand, Guid>
{
    private const int MaxBodyLength = 50_000;

    private readonly IApplicationDbContext _db;
    private readonly IContentEncryptionService _encryption;

    public CreateJournalEntryCommandHandler(
        IApplicationDbContext db,
        IContentEncryptionService encryption)
    {
        _db = db;
        _encryption = encryption;
    }

    public async Task<Guid> Handle(CreateJournalEntryCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Body))
            throw new ArgumentException("Günlük metni boş olamaz.", nameof(request.Body));

        var trimmed = request.Body.Trim();
        if (trimmed.Length > MaxBodyLength)
            throw new ArgumentException($"Günlük en fazla {MaxBodyLength} karakter olabilir.");

        var blob = await _encryption.EncryptJournalBodyAsync(request.UserId, trimmed, cancellationToken);

        var entry = JournalEntry.Create(request.UserId, request.Title, request.Mood, blob);
        _db.JournalEntries.Add(entry);
        await _db.SaveChangesAsync(cancellationToken);

        return entry.Id;
    }
}
