using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OmniMind.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class mig3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.Sql("""
                ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "AccountDeletionRequestedAtUtc" timestamp with time zone NULL;
                ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "ScheduledHardDeletionAtUtc" timestamp with time zone NULL;
                """);

            migrationBuilder.Sql(
                """CREATE INDEX IF NOT EXISTS "IX_Users_ScheduledHardDeletionAtUtc" ON "Users" ("ScheduledHardDeletionAtUtc");""");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """DROP INDEX IF EXISTS "IX_Users_ScheduledHardDeletionAtUtc";""");

            migrationBuilder.Sql("""
                ALTER TABLE "Users" DROP COLUMN IF EXISTS "ScheduledHardDeletionAtUtc";
                ALTER TABLE "Users" DROP COLUMN IF EXISTS "AccountDeletionRequestedAtUtc";
                """);
        }
    }
}
