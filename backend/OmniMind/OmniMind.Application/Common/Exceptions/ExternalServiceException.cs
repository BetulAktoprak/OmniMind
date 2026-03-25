namespace OmniMind.Application.Common.Exceptions;

/// <summary>Yapay zeka veya dış API geçici veya yapılandırma kaynaklı kullanılamadığında.</summary>
public sealed class ExternalServiceException : Exception
{
    public ExternalServiceException(string message) : base(message) { }

    public ExternalServiceException(string message, Exception innerException)
        : base(message, innerException) { }
}
