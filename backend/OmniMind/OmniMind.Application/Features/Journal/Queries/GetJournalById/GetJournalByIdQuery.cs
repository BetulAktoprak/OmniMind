using MediatR;
using OmniMind.Application.Features.Journal.Dtos;

namespace OmniMind.Application.Features.Journal.Queries.GetJournalById;

public sealed record GetJournalByIdQuery(Guid UserId, Guid JournalId) : IRequest<JournalDetailDto>;
