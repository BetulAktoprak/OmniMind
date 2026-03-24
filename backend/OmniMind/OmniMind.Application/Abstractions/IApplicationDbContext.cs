using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using OmniMind.Domain.Journal;

namespace OmniMind.Application.Abstractions;

public interface IApplicationDbContext
{
    DbSet<JournalEntry> JournalEntries { get; }
    DbSet<UserContentKey> UserContentKeys { get; }
    ChangeTracker ChangeTracker { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
