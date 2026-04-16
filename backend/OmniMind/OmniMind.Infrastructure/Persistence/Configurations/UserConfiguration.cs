using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OmniMind.Domain.Identity;

namespace OmniMind.Infrastructure.Persistence.Configurations;
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.IsActive)
            .IsRequired();

        builder.Property(u => u.CreatedAt)
            .IsRequired();

        builder.Property(u => u.PasswordHash)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(u => u.PasswordChangedAt)
            .IsRequired();

        builder.Property(u => u.AccountDeletionRequestedAtUtc);
        builder.Property(u => u.ScheduledHardDeletionAtUtc);

        builder.HasIndex(u => u.ScheduledHardDeletionAtUtc);

        // Email (ValueObject) -> Owned -> Users tablosunda Email kolonu
        builder.OwnsOne(u => u.Email, email =>
        {
            email.Property(e => e.Value)
                .HasColumnName("Email")
                .IsRequired()
                .HasMaxLength(256);

            // Unique Index (Owned property üzerinden)
            email.HasIndex(e => e.Value).IsUnique();

            // Owned type için PK gerekmez ama iyi pratik:
            email.WithOwner();
        });

        // Username (ValueObject) -> Owned -> Users tablosunda Username kolonu
        builder.OwnsOne(u => u.Username, username =>
        {
            username.Property(x => x.Value)
                .HasColumnName("Username")
                .IsRequired()
                .HasMaxLength(100);

            username.HasIndex(x => x.Value).IsUnique();

            username.WithOwner();
        });

        // PrivacySettings (ValueObject) -> Owned -> Users tablosunda 3 kolon
        builder.OwnsOne(u => u.PrivacySettings, ps =>
        {
            ps.Property(p => p.IsProfilePublic)
                .HasColumnName("IsProfilePublic")
                .IsRequired();

            ps.Property(p => p.ShareMoodData)
                .HasColumnName("ShareMoodData")
                .IsRequired();

            ps.Property(p => p.AllowAIAnalysis)
                .HasColumnName("AllowAIAnalysis")
                .IsRequired();

            ps.WithOwner();
        });

        // BirthInfo (ValueObject) -> Owned -> Users tablosunda opsiyonel kolonlar
        builder.OwnsOne(u => u.BirthInfo, bi =>
        {
            bi.Property(b => b.Date)
                .HasColumnName("BirthDate")
                .IsRequired();

            bi.Property(b => b.Time)
                .HasColumnName("BirthTime")
                .IsRequired(false);

            bi.WithOwner();
        });

        // Navigation: User -> Profile (1-1)
        // FK Profile tarafında (Profile.UserId) zaten var, o mapping ProfileConfiguration'da da olacak.
        builder.Navigation(u => u.Profile)
            .AutoInclude(false); // istersen true yaparsın; şimdilik kapalı kalsın
    }
}
