using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OmniMind.Domain.Identity;

namespace OmniMind.Infrastructure.Persistence.Configurations;
public class ProfileConfiguration : IEntityTypeConfiguration<Profile>
{
    public void Configure(EntityTypeBuilder<Profile> builder)
    {
        builder.ToTable("UserProfiles");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.DisplayName)
            .HasMaxLength(100);

        builder.Property(p => p.Bio)
            .HasMaxLength(500);

        builder.Property(p => p.AvatarUrl)
            .HasMaxLength(500);

        builder.Property(p => p.UserId)
            .IsRequired();

        // 1-1 ilişki: Her User'ın 1 Profile'ı olsun
        builder.HasOne(p => p.User)
            .WithOne(u => u.Profile)
            .HasForeignKey<Profile>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // 1-1 için UserId unique olmalı (aynı user'a 2 profil olmasın)
        builder.HasIndex(p => p.UserId).IsUnique();
    }
}
