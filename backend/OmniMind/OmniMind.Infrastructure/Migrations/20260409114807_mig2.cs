using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OmniMind.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class mig2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Deneme",
                table: "UserProfiles");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Deneme",
                table: "UserProfiles",
                type: "text",
                nullable: true);
        }
    }
}
