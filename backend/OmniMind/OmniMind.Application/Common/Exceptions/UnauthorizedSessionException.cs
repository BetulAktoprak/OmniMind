namespace OmniMind.Application.Common.Exceptions;

/// <summary>JWT kullanıcı kimliği veritabanında yok (ör. DB sıfırlandı, eski token).</summary>
public sealed class UnauthorizedSessionException : Exception
{
    public UnauthorizedSessionException(string message)
        : base(message) { }
}
