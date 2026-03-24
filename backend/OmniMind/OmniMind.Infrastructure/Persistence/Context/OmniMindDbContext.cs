using Microsoft.EntityFrameworkCore;
using OmniMind.Application.Abstractions;
using OmniMind.Domain.Common;
using OmniMind.Domain.Identity;
using OmniMind.Domain.Journal;

namespace OmniMind.Infrastructure.Persistence.Context;
public class OmniMindDbContext : DbContext, IApplicationDbContext
{
    public OmniMindDbContext(DbContextOptions<OmniMindDbContext> options)
        : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<UserConsent> UserConsents => Set<UserConsent>();
    public DbSet<JournalEntry> JournalEntries => Set<JournalEntry>();
    public DbSet<UserContentKey> UserContentKeys => Set<UserContentKey>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(OmniMindDbContext).Assembly);


        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            // BaseEntity.DomainEvents'i ignore et
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType).Ignore("DomainEvents");
            }
        }
        base.OnModelCreating(modelBuilder);
    }
}
