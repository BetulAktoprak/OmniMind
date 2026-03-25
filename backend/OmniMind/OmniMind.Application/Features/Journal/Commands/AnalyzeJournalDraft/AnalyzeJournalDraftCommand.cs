using MediatR;
using OmniMind.Application.Abstractions;

namespace OmniMind.Application.Features.Journal.Commands.AnalyzeJournalDraft;

public sealed record AnalyzeJournalDraftCommand(Guid UserId, string Body, string? Mood)
    : IRequest<JournalDraftInsight>;
