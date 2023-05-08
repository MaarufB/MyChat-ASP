using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyChat.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddContactEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Contacts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ContactOwnerId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ContactOwnerUsername = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContactPersonId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ContactPersonUsername = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContactAddedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Contacts_AspNetUsers_ContactOwnerId",
                        column: x => x.ContactOwnerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Contacts_AspNetUsers_ContactPersonId",
                        column: x => x.ContactPersonId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_ContactOwnerId",
                table: "Contacts",
                column: "ContactOwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_Contacts_ContactPersonId",
                table: "Contacts",
                column: "ContactPersonId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Contacts");
        }
    }
}
