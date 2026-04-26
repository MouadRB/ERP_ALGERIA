using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace engine_b.Migrations
{
    /// <inheritdoc />
    public partial class CRMInteractionsUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "customer_interactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_customer_interactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_customer_interactions_customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "customer_interactions",
                columns: new[] { "Id", "Content", "CreatedAt", "CreatedBy", "CustomerId", "Type" },
                values: new object[,]
                {
                    { new Guid("e1000000-0000-0000-0000-000000000001"), "Client VIP — a appelé pour confirmer sa commande #10040. Livraison OK.", new DateTime(2026, 4, 11, 17, 51, 21, 895, DateTimeKind.Utc).AddTicks(4772), "CRM Agent", new Guid("c1000000-0000-0000-0000-000000000001"), 0 },
                    { new Guid("e1000000-0000-0000-0000-000000000002"), "Message WhatsApp envoyé au client pour suivi du ticket #TKT-0881.", new DateTime(2026, 4, 10, 17, 51, 21, 895, DateTimeKind.Utc).AddTicks(4772), "CRM Agent", new Guid("c1000000-0000-0000-0000-000000000002"), 1 },
                    { new Guid("e1000000-0000-0000-0000-000000000003"), "Premier contact client — bien reçu la commande, très satisfaite.", new DateTime(2026, 4, 5, 17, 51, 21, 895, DateTimeKind.Utc).AddTicks(4772), "SuperAdmin", new Guid("c1000000-0000-0000-0000-000000000003"), 3 }
                });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2025, 10, 15, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880), new DateTime(2026, 4, 11, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2025, 12, 14, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880), new DateTime(2026, 4, 3, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2026, 4, 3, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880), new DateTime(2026, 4, 5, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000004"),
                columns: new[] { "BlacklistedAt", "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2026, 3, 29, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880), new DateTime(2025, 9, 25, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880), new DateTime(2026, 2, 27, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000005"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2025, 6, 17, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880), new DateTime(2026, 1, 3, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880) });

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 13, 16, 4, 21, 892, DateTimeKind.Utc).AddTicks(2632));

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 13, 17, 28, 21, 892, DateTimeKind.Utc).AddTicks(2632));

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 13, 17, 39, 21, 892, DateTimeKind.Utc).AddTicks(2632));

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000004"),
                columns: new[] { "ConfirmedAt", "CreatedAt" },
                values: new object[] { new DateTime(2026, 4, 13, 15, 51, 21, 892, DateTimeKind.Utc).AddTicks(2632), new DateTime(2026, 4, 13, 14, 51, 21, 892, DateTimeKind.Utc).AddTicks(2632) });

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000005"),
                columns: new[] { "ConfirmedAt", "CreatedAt", "DeliveredAt", "ShippedAt" },
                values: new object[] { new DateTime(2026, 4, 13, 10, 51, 21, 892, DateTimeKind.Utc).AddTicks(2632), new DateTime(2026, 4, 13, 9, 51, 21, 892, DateTimeKind.Utc).AddTicks(2632), new DateTime(2026, 4, 13, 16, 51, 21, 892, DateTimeKind.Utc).AddTicks(2632), new DateTime(2026, 4, 13, 12, 51, 21, 892, DateTimeKind.Utc).AddTicks(2632) });

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "LastActionAt" },
                values: new object[] { new DateTime(2026, 4, 10, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880), new DateTime(2026, 4, 11, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880) });

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "LastActionAt", "Status" },
                values: new object[] { new DateTime(2026, 4, 6, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880), new DateTime(2026, 4, 7, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880), 3 });

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "LastActionAt", "ResolvedAt", "Status" },
                values: new object[] { new DateTime(2026, 3, 29, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880), new DateTime(2026, 4, 1, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880), new DateTime(2026, 4, 1, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880), 5 });

            migrationBuilder.CreateIndex(
                name: "IX_support_tickets_Status",
                table: "support_tickets",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_support_tickets_TicketNumber",
                table: "support_tickets",
                column: "TicketNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_customer_interactions_CreatedAt",
                table: "customer_interactions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_customer_interactions_CustomerId",
                table: "customer_interactions",
                column: "CustomerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "customer_interactions");

            migrationBuilder.DropIndex(
                name: "IX_support_tickets_Status",
                table: "support_tickets");

            migrationBuilder.DropIndex(
                name: "IX_support_tickets_TicketNumber",
                table: "support_tickets");

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2025, 10, 15, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), new DateTime(2026, 4, 11, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2025, 12, 14, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), new DateTime(2026, 4, 3, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2026, 4, 3, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), new DateTime(2026, 4, 5, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000004"),
                columns: new[] { "BlacklistedAt", "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2026, 3, 29, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), new DateTime(2025, 9, 25, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), new DateTime(2026, 2, 27, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000005"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2025, 6, 17, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), new DateTime(2026, 1, 3, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029) });

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 13, 15, 25, 59, 794, DateTimeKind.Utc).AddTicks(5486));

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 13, 16, 49, 59, 794, DateTimeKind.Utc).AddTicks(5486));

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 13, 17, 0, 59, 794, DateTimeKind.Utc).AddTicks(5486));

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000004"),
                columns: new[] { "ConfirmedAt", "CreatedAt" },
                values: new object[] { new DateTime(2026, 4, 13, 15, 12, 59, 794, DateTimeKind.Utc).AddTicks(5486), new DateTime(2026, 4, 13, 14, 12, 59, 794, DateTimeKind.Utc).AddTicks(5486) });

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000005"),
                columns: new[] { "ConfirmedAt", "CreatedAt", "DeliveredAt", "ShippedAt" },
                values: new object[] { new DateTime(2026, 4, 13, 10, 12, 59, 794, DateTimeKind.Utc).AddTicks(5486), new DateTime(2026, 4, 13, 9, 12, 59, 794, DateTimeKind.Utc).AddTicks(5486), new DateTime(2026, 4, 13, 16, 12, 59, 794, DateTimeKind.Utc).AddTicks(5486), new DateTime(2026, 4, 13, 12, 12, 59, 794, DateTimeKind.Utc).AddTicks(5486) });

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "LastActionAt" },
                values: new object[] { new DateTime(2026, 4, 10, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), new DateTime(2026, 4, 11, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029) });

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "LastActionAt", "Status" },
                values: new object[] { new DateTime(2026, 4, 6, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), new DateTime(2026, 4, 7, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), 2 });

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "LastActionAt", "ResolvedAt", "Status" },
                values: new object[] { new DateTime(2026, 3, 29, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), new DateTime(2026, 4, 1, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), new DateTime(2026, 4, 1, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), 4 });
        }
    }
}
