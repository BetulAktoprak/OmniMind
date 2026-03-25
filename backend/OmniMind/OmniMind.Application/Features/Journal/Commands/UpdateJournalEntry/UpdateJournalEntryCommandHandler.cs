using MediatR;
using Microsoft.EntityFrameworkCore;
using OmniMind.Application.Abstractions;
using OmniMind.Application.Common.Exceptions;

namespace OmniMind.Application.Features.Journal.Commands.UpdateJournalEntry;

public sealed class UpdateJournalEntryCommandHandler : IRequestHandler<UpdateJournalEntryCommand, Unit>
{
    private const int MaxBodyLength = 50_000;

    private readonly IApplicationDbContext _db;
    private readonly IContentEncryptionService _encryption;

    public UpdateJournalEntryCommandHandler(
        IApplicationDbContext db,
        IContentEncryptionService encryption)
    {
        _db = db;
        _encryption = encryption;
    }

    public async Task<Unit> Handle(UpdateJournalEntryCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Body))
            throw new ArgumentException("Günlük metni boş olamaz.", nameof(request.Body));

        var trimmed = request.Body.Trim();
        if (trimmed.Length > MaxBodyLength)
            throw new ArgumentException($"Günlük en fazla {MaxBodyLength} karakter olabilir.");

        var entry = await _db.JournalEntries
            .FirstOrDefaultAsync(
                j => j.Id == request.JournalId && j.UserId == request.UserId && !j.IsDeleted,
                cancellationToken);

        if (entry is null)
            throw new NotFoundException("Günlük bulunamadı.");

        var blob = await _encryption.EncryptJournalBodyAsync(request.UserId, trimmed, cancellationToken);
        entry.Update(request.Title, request.Mood, blob);
        if (request.AiInsight != null)
            entry.SetAiInsight(request.AiInsight.Comment, request.AiInsight.MusicSuggestion);

        await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
