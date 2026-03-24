using MediatR;
using OmniMind.Application.Features.Journal.Dtos;

namespace OmniMind.Application.Features.Journal.Queries.GetJournalEntries;

public sealed record GetJournalEntriesQuery(Guid UserId, int Page, int PageSize)
    : IRequest<PagedResult<JournalListItemDto>>;
