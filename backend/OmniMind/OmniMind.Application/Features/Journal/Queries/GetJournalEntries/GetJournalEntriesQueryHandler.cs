using MediatR;
using Microsoft.EntityFrameworkCore;
using OmniMind.Application.Abstractions;
using OmniMind.Application.Features.Journal.Dtos;

namespace OmniMind.Application.Features.Journal.Queries.GetJournalEntries;

public sealed class GetJournalEntriesQueryHandler
    : IRequestHandler<GetJournalEntriesQuery, PagedResult<JournalListItemDto>>
{
    private readonly IApplicationDbContext _db;

    public GetJournalEntriesQueryHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<JournalListItemDto>> Handle(
        GetJournalEntriesQuery request,
        CancellationToken cancellationToken)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var baseQuery = _db.JournalEntries
            .AsNoTracking()
            .Where(j => j.UserId == request.UserId && !j.IsDeleted);

        var total = await baseQuery.CountAsync(cancellationToken);

        var items = await baseQuery
            .OrderByDescending(j => j.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(j => new JournalListItemDto(j.Id, j.Title, j.Mood, j.CreatedAt, j.UpdatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<JournalListItemDto>(items, total, page, pageSize);
    }
}
