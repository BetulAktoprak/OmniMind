namespace OmniMind.Domain.Identity;
public enum ConsentType
{
    TermsOfService = 1, //Kullanım şartlarını kabul ediyorum
    PrivacyPolicy = 2, //Gizlilik politikasını kabul ediyorum
    AIAnalysis = 3, //Verilerimin AI tarafından analiz edilmesine izin veriyorum
    DataSharing = 4, //Anonim verilerimin paylaşılmasına izin veriyorum
    PersonalizedAds = 5 //Kişiselleştirilmiş reklamlar için izin veriyorum
}
