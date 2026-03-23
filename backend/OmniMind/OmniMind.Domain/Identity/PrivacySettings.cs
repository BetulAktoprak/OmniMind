using OmniMind.Domain.Common;

namespace OmniMind.Domain.Identity;
public class PrivacySettings : ValueObject
{
    public bool IsProfilePublic { get; private set; }
    public bool ShareMoodData { get; private set; }
    public bool AllowAIAnalysis { get; private set; }

    private PrivacySettings() { }

    public static PrivacySettings Create(
    bool isProfilePublic,
    bool shareMoodData,
    bool allowAIAnalysis)
    {
        return new PrivacySettings
        {
            IsProfilePublic = isProfilePublic,
            ShareMoodData = shareMoodData,
            AllowAIAnalysis = allowAIAnalysis
        };
    }


    public static PrivacySettings Default()
    {
        return new PrivacySettings
        {
            IsProfilePublic = false,
            ShareMoodData = false,
            AllowAIAnalysis = true
        };
    }
    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return IsProfilePublic;
        yield return ShareMoodData;
        yield return AllowAIAnalysis;
    }
}
