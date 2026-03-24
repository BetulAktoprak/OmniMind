namespace OmniMind.Application.Abstractions;

public interface IContentEncryptionService
{
    Task<byte[]> EncryptJournalBodyAsync(Guid userId, string plainText, CancellationToken cancellationToken = default);

    Task<string> DecryptJournalBodyAsync(Guid userId, byte[] encryptedBlob, CancellationToken cancellationToken = default);
}
