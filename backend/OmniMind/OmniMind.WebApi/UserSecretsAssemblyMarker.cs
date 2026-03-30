namespace OmniMind.WebApi;

/// <summary>
/// Top-level Program ile AddUserSecrets&lt;Program&gt;() bazen yanlış assembly'yi hedefleyebilir;
/// bu tip WebApi csproj'daki UserSecretsId ile eşleşmeyi garanti eder.
/// (static class generic argüman olamaz; sealed instance type kullanılır.)
/// </summary>
internal sealed class UserSecretsAssemblyMarker;
