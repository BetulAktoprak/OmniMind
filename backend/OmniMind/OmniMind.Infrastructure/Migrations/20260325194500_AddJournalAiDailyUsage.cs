using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using OmniMind.Infrastructure.Persistence.Context;

#nullable disable

namespace OmniMind.Infrastructure.Migrations
{
    [DbContext(typeof(OmniMindDbContext))]
    [Migration("20260325194500_AddJournalAiDailyUsage")]
    public class AddJournalAiDailyUsage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "JournalAiDailyUsages",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UtcDate = table.Column<DateTime>(type: "date", nullable: false),
                    RequestCount = table.Column<int>(type: "int", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JournalAiDailyUsages", x => new { x.UserId, x.UtcDate });
                    table.ForeignKey(
                        name: "FK_JournalAiDailyUsages_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "JournalAiDailyUsages");
        }
    }
}
