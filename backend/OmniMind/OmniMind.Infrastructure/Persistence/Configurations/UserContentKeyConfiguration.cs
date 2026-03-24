using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OmniMind.Domain.Identity;
using OmniMind.Domain.Journal;

namespace OmniMind.Infrastructure.Persistence.Configurations;

public class UserContentKeyConfiguration : IEntityTypeConfiguration<UserContentKey>
{
    public void Configure(EntityTypeBuilder<UserContentKey> builder)
    {
        builder.ToTable("UserContentKeys");

        builder.HasKey(k => k.UserId);

        builder.Property(k => k.WrappedKeyMaterial)
            .IsRequired();

        builder.Property(k => k.CreatedAt)
            .IsRequired();

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(k => k.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
