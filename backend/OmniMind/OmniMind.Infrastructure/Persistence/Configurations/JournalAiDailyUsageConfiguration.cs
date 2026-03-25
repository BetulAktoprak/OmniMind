using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OmniMind.Domain.Identity;
using OmniMind.Domain.Journal;

namespace OmniMind.Infrastructure.Persistence.Configurations;

public class JournalAiDailyUsageConfiguration : IEntityTypeConfiguration<JournalAiDailyUsage>
{
    public void Configure(EntityTypeBuilder<JournalAiDailyUsage> builder)
    {
        builder.ToTable("JournalAiDailyUsages");

        builder.HasKey(x => new { x.UserId, x.UtcDate });

        builder.Property(x => x.UtcDate)
            .HasColumnType("date");

        builder.Property(x => x.RequestCount)
            .IsRequired();

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
