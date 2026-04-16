namespace OmniMind.WebApi.Options;

public class AccountDeletionOptions
{
    public const string SectionName = "AccountDeletion";

    /// <summary>Ertelenmiş silme süresi (gün). Bu süre sonunda kullanıcı ve ilişkili veriler kalıcı silinir.</summary>
    public int GraceDays { get; set; } = 30;
}
