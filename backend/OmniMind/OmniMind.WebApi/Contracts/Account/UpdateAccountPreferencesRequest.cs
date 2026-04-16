namespace OmniMind.WebApi.Contracts.Account;

public sealed class UpdateAccountPreferencesRequest
{
    public bool AllowAiJournalAnalysis { get; set; }
    public bool PersonalizedRecommendations { get; set; }
}
