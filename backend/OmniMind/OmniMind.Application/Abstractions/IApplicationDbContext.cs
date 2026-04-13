using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Infrastructure;
using OmniMind.Domain.Identity;
using OmniMind.Domain.Journal;

namespace OmniMind.Application.Abstractions;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<JournalEntry> JournalEntries { get; }
    DbSet<UserContentKey> UserContentKeys { get; }
    DbSet<JournalAiDailyUsage> JournalAiDailyUsages { get; }
    DatabaseFacade Database { get; }
    ChangeTracker ChangeTracker { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
