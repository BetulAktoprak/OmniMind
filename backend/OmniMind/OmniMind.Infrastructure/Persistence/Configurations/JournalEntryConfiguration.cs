using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OmniMind.Domain.Identity;
using OmniMind.Domain.Journal;

namespace OmniMind.Infrastructure.Persistence.Configurations;

public class JournalEntryConfiguration : IEntityTypeConfiguration<JournalEntry>
{
    public void Configure(EntityTypeBuilder<JournalEntry> builder)
    {
        builder.ToTable("JournalEntries");

        builder.HasKey(j => j.Id);

        builder.Property(j => j.UserId).IsRequired();

        builder.Property(j => j.Title)
            .HasMaxLength(200);

        builder.Property(j => j.Mood)
            .HasMaxLength(64);

        builder.Property(j => j.EncryptedContent)
            .IsRequired();

        builder.Property(j => j.CreatedAt).IsRequired();
        builder.Property(j => j.UpdatedAt).IsRequired();
        builder.Property(j => j.IsDeleted).IsRequired();
        builder.Property(j => j.DeletedAt);

        builder.HasIndex(j => new { j.UserId, j.CreatedAt });

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(j => j.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
