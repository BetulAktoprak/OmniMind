using MediatR;
using Microsoft.EntityFrameworkCore;
using OmniMind.Application.Abstractions;
using OmniMind.Application.Common.Exceptions;
using OmniMind.Application.Features.Journal.Dtos;

namespace OmniMind.Application.Features.Journal.Queries.GetJournalById;

public sealed class GetJournalByIdQueryHandler : IRequestHandler<GetJournalByIdQuery, JournalDetailDto>
{
    private readonly IApplicationDbContext _db;
    private readonly IContentEncryptionService _encryption;

    public GetJournalByIdQueryHandler(
        IApplicationDbContext db,
        IContentEncryptionService encryption)
    {
        _db = db;
        _encryption = encryption;
    }

    public async Task<JournalDetailDto> Handle(GetJournalByIdQuery request, CancellationToken cancellationToken)
    {
        var entry = await _db.JournalEntries
            .AsNoTracking()
            .FirstOrDefaultAsync(
                j => j.Id == request.JournalId && j.UserId == request.UserId && !j.IsDeleted,
                cancellationToken);

        if (entry is null)
            throw new NotFoundException("Günlük bulunamadı.");

        var body = await _encryption.DecryptJournalBodyAsync(request.UserId, entry.EncryptedContent, cancellationToken);

        return new JournalDetailDto(
            entry.Id,
            entry.Title,
            entry.Mood,
            body,
            entry.CreatedAt,
            entry.UpdatedAt,
            entry.AiComment,
            entry.AiMusicSuggestion,
            entry.AiInsightGeneratedAt);
    }
}
