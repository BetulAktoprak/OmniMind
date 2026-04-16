using Microsoft.EntityFrameworkCore;
using OmniMind.Application.Common.Exceptions;

namespace OmniMind.Application.Abstractions;

public static class IApplicationDbContextUserGuard
{
    public static async Task EnsureUserExistsAsync(
        this IApplicationDbContext db,
        Guid userId,
        CancellationToken cancellationToken)
    {
        if (!await db.Users.AnyAsync(u => u.Id == userId && u.IsActive, cancellationToken))
        {
            throw new UnauthorizedSessionException(
                "Oturumunuz geçersiz veya hesabınız bu sunucuda bulunamadı. Lütfen çıkış yapıp tekrar giriş yapın.");
        }
    }
}
