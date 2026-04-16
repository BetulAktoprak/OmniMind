namespace OmniMind.WebApi.Contracts.Account;

public sealed class RequestAccountDeletionResponse
{
    public DateTime PurgeAfterUtc { get; set; }
    public string Message { get; set; } = "";
}
