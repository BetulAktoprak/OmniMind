using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using OmniMind.Application.Abstractions;
using OmniMind.Domain.Journal;

namespace OmniMind.Infrastructure.Security;

/// <summary>
/// Kullanıcı başına DEK (AES-256), sunucu ana anahtarı ile sarılır. Günlük gövdesi DEK ile AES-GCM.
/// </summary>
public sealed class ContentEncryptionService : IContentEncryptionService, IDisposable
{
    private const int NonceSize = 12;
    private const int TagSize = 16;
    private const int DekSize = 32;

    private readonly IApplicationDbContext _db;
    private readonly byte[] _masterKey;

    public ContentEncryptionService(IApplicationDbContext db, IConfiguration configuration)
    {
        _db = db;
        var b64 = configuration["DataEncryption:MasterKeyBase64"]
                  ?? throw new InvalidOperationException(
                      "DataEncryption:MasterKeyBase64 yapılandırması eksik. Üretmek için: dotnet run --project ... veya openssl rand -base64 32");
        _masterKey = Convert.FromBase64String(b64);
        if (_masterKey.Length != DekSize)
            throw new InvalidOperationException("Master anahtar Base64 çözüldüğünde tam 32 bayt (256 bit) olmalıdır.");
    }

    public async Task<byte[]> EncryptJournalBodyAsync(Guid userId, string plainText, CancellationToken cancellationToken = default)
    {
        var dek = await GetOrCreateUserDekAsync(userId, cancellationToken);
        var plainBytes = Encoding.UTF8.GetBytes(plainText);
        return EncryptWithDek(dek, plainBytes);
    }

    private static byte[] EncryptWithDek(byte[] dek, ReadOnlySpan<byte> plainBytes)
    {
        using var aes = new AesGcm(dek, TagSize);
        Span<byte> nonce = stackalloc byte[NonceSize];
        RandomNumberGenerator.Fill(nonce);

        var ciphertext = new byte[plainBytes.Length];
        var tag = new byte[TagSize];
        aes.Encrypt(nonce, plainBytes, ciphertext, tag);

        var result = new byte[NonceSize + plainBytes.Length + TagSize];
        nonce.CopyTo(result.AsSpan(0, NonceSize));
        Buffer.BlockCopy(ciphertext, 0, result, NonceSize, plainBytes.Length);
        Buffer.BlockCopy(tag, 0, result, NonceSize + plainBytes.Length, TagSize);
        return result;
    }

    public async Task<string> DecryptJournalBodyAsync(Guid userId, byte[] encryptedBlob, CancellationToken cancellationToken = default)
    {
        if (encryptedBlob.Length < NonceSize + TagSize)
            throw new CryptographicException("Şifreli içerik geçersiz.");

        var keyRow = await _db.UserContentKeys
            .AsNoTracking()
            .FirstOrDefaultAsync(k => k.UserId == userId, cancellationToken);

        if (keyRow is null)
            throw new CryptographicException("Kullanıcı şifre anahtarı bulunamadı.");

        var dek = UnwrapDek(keyRow.WrappedKeyMaterial);

        var textLen = encryptedBlob.Length - NonceSize - TagSize;
        if (textLen < 0)
            throw new CryptographicException("Şifreli içerik geçersiz.");

        var nonce = new byte[NonceSize];
        Buffer.BlockCopy(encryptedBlob, 0, nonce, 0, NonceSize);

        var ciphertext = new byte[textLen];
        Buffer.BlockCopy(encryptedBlob, NonceSize, ciphertext, 0, textLen);

        var tag = new byte[TagSize];
        Buffer.BlockCopy(encryptedBlob, NonceSize + textLen, tag, 0, TagSize);

        var plain = new byte[textLen];
        using var aes = new AesGcm(dek, TagSize);
        aes.Decrypt(nonce, ciphertext, tag, plain);

        return Encoding.UTF8.GetString(plain);
    }

    private async Task<byte[]> GetOrCreateUserDekAsync(Guid userId, CancellationToken cancellationToken)
    {
        var row = await _db.UserContentKeys
            .FirstOrDefaultAsync(k => k.UserId == userId, cancellationToken);

        if (row is not null)
            return UnwrapDek(row.WrappedKeyMaterial);

        var dek = RandomNumberGenerator.GetBytes(DekSize);
        var wrapped = WrapDekWithMasterKey(dek);

        _db.UserContentKeys.Add(UserContentKey.Create(userId, wrapped));

        try
        {
            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            _db.ChangeTracker.Clear();
            var again = await _db.UserContentKeys
                .AsNoTracking()
                .FirstOrDefaultAsync(k => k.UserId == userId, cancellationToken);
            if (again is null)
                throw;
            return UnwrapDek(again.WrappedKeyMaterial);
        }

        return dek;
    }

    private byte[] WrapDekWithMasterKey(ReadOnlySpan<byte> dek)
    {
        Span<byte> nonce = stackalloc byte[NonceSize];
        RandomNumberGenerator.Fill(nonce);

        var ciphertext = new byte[dek.Length];
        var tag = new byte[TagSize];
        using (var aes = new AesGcm(_masterKey, TagSize))
        {
            aes.Encrypt(nonce, dek, ciphertext, tag);
        }

        var blob = new byte[NonceSize + ciphertext.Length + TagSize];
        nonce.CopyTo(blob.AsSpan(0, NonceSize));
        Buffer.BlockCopy(ciphertext, 0, blob, NonceSize, ciphertext.Length);
        Buffer.BlockCopy(tag, 0, blob, NonceSize + ciphertext.Length, TagSize);
        return blob;
    }

    private byte[] UnwrapDek(byte[] blob)
    {
        if (blob.Length < NonceSize + DekSize + TagSize)
            throw new CryptographicException("Sarılı anahtar geçersiz.");

        var nonce = new byte[NonceSize];
        Buffer.BlockCopy(blob, 0, nonce, 0, NonceSize);

        var ciphertext = new byte[DekSize];
        Buffer.BlockCopy(blob, NonceSize, ciphertext, 0, DekSize);

        var tag = new byte[TagSize];
        Buffer.BlockCopy(blob, NonceSize + DekSize, tag, 0, TagSize);

        var dek = new byte[DekSize];
        using var aes = new AesGcm(_masterKey, TagSize);
        aes.Decrypt(nonce, ciphertext, tag, dek);
        return dek;
    }

    public void Dispose()
    {
        CryptographicOperations.ZeroMemory(_masterKey);
    }
}
