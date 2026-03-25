using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OmniMind.Application.Features.Journal.Commands.AnalyzeJournalDraft;
using OmniMind.Application.Features.Journal.Commands.CreateJournalEntry;
using OmniMind.Application.Features.Journal.Dtos;
using OmniMind.Application.Features.Journal.Commands.DeleteJournalEntry;
using OmniMind.Application.Features.Journal.Commands.UpdateJournalEntry;
using OmniMind.Application.Features.Journal.Queries.GetJournalById;
using OmniMind.Application.Features.Journal.Queries.GetJournalEntries;
using OmniMind.WebApi.Abstractions;
using OmniMind.WebApi.Contracts.Journal;

namespace OmniMind.WebApi.Controllers;

[Authorize]
public class JournalController : ApiController
{
    private readonly IMediator _mediator;

    public JournalController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<AnalyzeJournalDraftResponse>> AnalyzeDraft(
        [FromBody] AnalyzeJournalDraftRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _mediator.Send(
            new AnalyzeJournalDraftCommand(userId, request.Body, request.Mood),
            cancellationToken);
        return Ok(new AnalyzeJournalDraftResponse
        {
            Comment = result.Comment,
            MusicSuggestion = result.MusicSuggestion,
        });
    }

    [HttpPost]
    public async Task<ActionResult<CreateJournalResponse>> Create(
        [FromBody] CreateJournalRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var insight = MapInsight(request.Insight);
        var id = await _mediator.Send(
            new CreateJournalEntryCommand(userId, request.Title, request.Mood, request.Body, insight),
            cancellationToken);
        return Ok(new CreateJournalResponse(id));
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<JournalListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();
        var result = await _mediator.Send(
            new GetJournalEntriesQuery(userId, page, pageSize),
            cancellationToken);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<JournalDetailDto>> GetById(
        [FromQuery] Guid id,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var dto = await _mediator.Send(new GetJournalByIdQuery(userId, id), cancellationToken);
        return Ok(dto);
    }

    [HttpPut]
    public async Task<ActionResult> Update(
        [FromQuery] Guid id,
        [FromBody] UpdateJournalRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var insight = MapInsight(request.Insight);
        await _mediator.Send(
            new UpdateJournalEntryCommand(userId, id, request.Title, request.Mood, request.Body, insight),
            cancellationToken);
        return Ok();
    }

    [HttpDelete]
    public async Task<ActionResult> Delete([FromQuery] Guid id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        await _mediator.Send(new DeleteJournalEntryCommand(userId, id), cancellationToken);
        return Ok();
    }

    private static JournalInsightInput? MapInsight(JournalInsightPayload? p) =>
        p is null ? null : new JournalInsightInput(p.Comment, p.MusicSuggestion);

    private Guid GetUserId()
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                  ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(sub) || !Guid.TryParse(sub, out var id))
            throw new InvalidOperationException("Geçersiz kullanıcı kimliği.");
        return id;
    }
}
