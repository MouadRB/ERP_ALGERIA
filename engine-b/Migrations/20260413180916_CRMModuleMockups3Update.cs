using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace engine_b.Migrations
{
    /// <inheritdoc />
    public partial class CRMModuleMockups3Update : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "support_tickets",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BlacklistNotes",
                table: "customers",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "customer_interactions",
                keyColumn: "Id",
                keyValue: new Guid("e1000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 11, 18, 9, 15, 498, DateTimeKind.Utc).AddTicks(5330));

            migrationBuilder.UpdateData(
                table: "customer_interactions",
                keyColumn: "Id",
                keyValue: new Guid("e1000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 10, 18, 9, 15, 498, DateTimeKind.Utc).AddTicks(5330));

            migrationBuilder.UpdateData(
                table: "customer_interactions",
                keyColumn: "Id",
                keyValue: new Guid("e1000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 5, 18, 9, 15, 498, DateTimeKind.Utc).AddTicks(5330));

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000001"),
                columns: new[] { "BlacklistNotes", "CreatedAt", "LastOrderDate" },
                values: new object[] { null, new DateTime(2025, 10, 15, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805), new DateTime(2026, 4, 11, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000002"),
                columns: new[] { "BlacklistNotes", "CreatedAt", "LastOrderDate" },
                values: new object[] { null, new DateTime(2025, 12, 14, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805), new DateTime(2026, 4, 3, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000003"),
                columns: new[] { "BlacklistNotes", "CreatedAt", "LastOrderDate" },
                values: new object[] { null, new DateTime(2026, 4, 3, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805), new DateTime(2026, 4, 5, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000004"),
                columns: new[] { "BlacklistNotes", "BlacklistedAt", "CreatedAt", "LastOrderDate" },
                values: new object[] { null, new DateTime(2026, 3, 29, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805), new DateTime(2025, 9, 25, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805), new DateTime(2026, 2, 27, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000005"),
                columns: new[] { "BlacklistNotes", "CreatedAt", "LastOrderDate" },
                values: new object[] { null, new DateTime(2025, 6, 17, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805), new DateTime(2026, 1, 3, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805) });

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 13, 16, 22, 15, 492, DateTimeKind.Utc).AddTicks(7825));

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 13, 17, 46, 15, 492, DateTimeKind.Utc).AddTicks(7825));

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 13, 17, 57, 15, 492, DateTimeKind.Utc).AddTicks(7825));

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000004"),
                columns: new[] { "ConfirmedAt", "CreatedAt" },
                values: new object[] { new DateTime(2026, 4, 13, 16, 9, 15, 492, DateTimeKind.Utc).AddTicks(7825), new DateTime(2026, 4, 13, 15, 9, 15, 492, DateTimeKind.Utc).AddTicks(7825) });

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000005"),
                columns: new[] { "ConfirmedAt", "CreatedAt", "DeliveredAt", "ShippedAt" },
                values: new object[] { new DateTime(2026, 4, 13, 11, 9, 15, 492, DateTimeKind.Utc).AddTicks(7825), new DateTime(2026, 4, 13, 10, 9, 15, 492, DateTimeKind.Utc).AddTicks(7825), new DateTime(2026, 4, 13, 17, 9, 15, 492, DateTimeKind.Utc).AddTicks(7825), new DateTime(2026, 4, 13, 13, 9, 15, 492, DateTimeKind.Utc).AddTicks(7825) });

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "Description", "LastActionAt" },
                values: new object[] { new DateTime(2026, 4, 10, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805), "", new DateTime(2026, 4, 11, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805) });

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "Description", "LastActionAt" },
                values: new object[] { new DateTime(2026, 4, 6, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805), "", new DateTime(2026, 4, 7, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805) });

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "Description", "LastActionAt", "ResolvedAt" },
                values: new object[] { new DateTime(2026, 3, 29, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805), "", new DateTime(2026, 4, 1, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805), new DateTime(2026, 4, 1, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "support_tickets");

            migrationBuilder.DropColumn(
                name: "BlacklistNotes",
                table: "customers");

            migrationBuilder.UpdateData(
                table: "customer_interactions",
                keyColumn: "Id",
                keyValue: new Guid("e1000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 11, 17, 51, 21, 895, DateTimeKind.Utc).AddTicks(4772));

            migrationBuilder.UpdateData(
                table: "customer_interactions",
                keyColumn: "Id",
                keyValue: new Guid("e1000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 10, 17, 51, 21, 895, DateTimeKind.Utc).AddTicks(4772));

            migrationBuilder.UpdateData(
                table: "customer_interactions",
                keyColumn: "Id",
                keyValue: new Guid("e1000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 5, 17, 51, 21, 895, DateTimeKind.Utc).AddTicks(4772));

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
                columns: new[] { "CreatedAt", "LastActionAt" },
                values: new object[] { new DateTime(2026, 4, 6, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880), new DateTime(2026, 4, 7, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880) });

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "LastActionAt", "ResolvedAt" },
                values: new object[] { new DateTime(2026, 3, 29, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880), new DateTime(2026, 4, 1, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880), new DateTime(2026, 4, 1, 17, 51, 21, 893, DateTimeKind.Utc).AddTicks(9880) });
        }
    }
}
