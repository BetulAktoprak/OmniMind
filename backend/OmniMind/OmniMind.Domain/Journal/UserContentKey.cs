namespace OmniMind.Domain.Journal;

/// <summary>
/// Kullanıcıya özel veri şifreleme anahtarı (DEK), sunucu ana anahtarı ile sarılmış halde saklanır.
/// </summary>
public class UserContentKey
{
    public Guid UserId { get; private set; }
    public byte[] WrappedKeyMaterial { get; private set; } = default!;
    public DateTime CreatedAt { get; private set; }

    private UserContentKey() { }

    public static UserContentKey Create(Guid userId, byte[] wrappedKeyMaterial)
    {
        ArgumentNullException.ThrowIfNull(wrappedKeyMaterial);
        if (wrappedKeyMaterial.Length < 12 + 16)
            throw new ArgumentException("Wrapped key material is too short.", nameof(wrappedKeyMaterial));

        return new UserContentKey
        {
            UserId = userId,
            WrappedKeyMaterial = wrappedKeyMaterial,
            CreatedAt = DateTime.UtcNow
        };
    }
}
