using System;
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
            migrationBuilder.AddColumn<string>(
                name: "AiComment",
                table: "JournalEntries",
                type: "nvarchar(max)",
                maxLength: 8000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AiInsightGeneratedAt",
                table: "JournalEntries",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AiMusicSuggestion",
                table: "JournalEntries",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AiComment",
                table: "JournalEntries");

            migrationBuilder.DropColumn(
                name: "AiInsightGeneratedAt",
                table: "JournalEntries");

            migrationBuilder.DropColumn(
                name: "AiMusicSuggestion",
                table: "JournalEntries");
        }
    }
}
