using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace engine_b.Migrations
{
    /// <inheritdoc />
    public partial class InboundEventsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TenantId",
                table: "users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "processed_events",
                columns: table => new
                {
                    EventId = table.Column<Guid>(type: "uuid", nullable: false),
                    EventType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Source = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_processed_events", x => x.EventId);
                });

            migrationBuilder.UpdateData(
                table: "customer_interactions",
                keyColumn: "Id",
                keyValue: new Guid("e1000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 24, 15, 18, 17, 51, DateTimeKind.Utc).AddTicks(1267));

            migrationBuilder.UpdateData(
                table: "customer_interactions",
                keyColumn: "Id",
                keyValue: new Guid("e1000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 23, 15, 18, 17, 51, DateTimeKind.Utc).AddTicks(1267));

            migrationBuilder.UpdateData(
                table: "customer_interactions",
                keyColumn: "Id",
                keyValue: new Guid("e1000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 18, 15, 18, 17, 51, DateTimeKind.Utc).AddTicks(1267));

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2025, 10, 28, 15, 18, 17, 47, DateTimeKind.Utc).AddTicks(6419), new DateTime(2026, 4, 24, 15, 18, 17, 47, DateTimeKind.Utc).AddTicks(6419) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2025, 12, 27, 15, 18, 17, 47, DateTimeKind.Utc).AddTicks(6419), new DateTime(2026, 4, 16, 15, 18, 17, 47, DateTimeKind.Utc).AddTicks(6419) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2026, 4, 16, 15, 18, 17, 47, DateTimeKind.Utc).AddTicks(6419), new DateTime(2026, 4, 18, 15, 18, 17, 47, DateTimeKind.Utc).AddTicks(6419) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000004"),
                columns: new[] { "BlacklistedAt", "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2026, 4, 11, 15, 18, 17, 47, DateTimeKind.Utc).AddTicks(6419), new DateTime(2025, 10, 8, 15, 18, 17, 47, DateTimeKind.Utc).AddTicks(6419), new DateTime(2026, 3, 12, 15, 18, 17, 47, DateTimeKind.Utc).AddTicks(6419) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000005"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2025, 6, 30, 15, 18, 17, 47, DateTimeKind.Utc).AddTicks(6419), new DateTime(2026, 1, 16, 15, 18, 17, 47, DateTimeKind.Utc).AddTicks(6419) });

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 26, 13, 31, 17, 41, DateTimeKind.Utc).AddTicks(7805));

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 26, 14, 55, 17, 41, DateTimeKind.Utc).AddTicks(7805));

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 26, 15, 6, 17, 41, DateTimeKind.Utc).AddTicks(7805));

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000004"),
                columns: new[] { "ConfirmedAt", "CreatedAt" },
                values: new object[] { new DateTime(2026, 4, 26, 13, 18, 17, 41, DateTimeKind.Utc).AddTicks(7805), new DateTime(2026, 4, 26, 12, 18, 17, 41, DateTimeKind.Utc).AddTicks(7805) });

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000005"),
                columns: new[] { "ConfirmedAt", "CreatedAt", "DeliveredAt", "ShippedAt" },
                values: new object[] { new DateTime(2026, 4, 26, 8, 18, 17, 41, DateTimeKind.Utc).AddTicks(7805), new DateTime(2026, 4, 26, 7, 18, 17, 41, DateTimeKind.Utc).AddTicks(7805), new DateTime(2026, 4, 26, 14, 18, 17, 41, DateTimeKind.Utc).AddTicks(7805), new DateTime(2026, 4, 26, 10, 18, 17, 41, DateTimeKind.Utc).AddTicks(7805) });

            migrationBuilder.UpdateData(
                table: "proc_purchase_order_audit_events",
                keyColumn: "Id",
                keyValue: new Guid("f6000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 24, 15, 18, 17, 53, DateTimeKind.Utc).AddTicks(3409));

            migrationBuilder.UpdateData(
                table: "proc_purchase_order_audit_events",
                keyColumn: "Id",
                keyValue: new Guid("f6000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 23, 15, 18, 17, 53, DateTimeKind.Utc).AddTicks(3409));

            migrationBuilder.UpdateData(
                table: "proc_purchase_orders",
                keyColumn: "Id",
                keyValue: new Guid("f2000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "EtaDate" },
                values: new object[] { new DateTime(2026, 4, 24, 15, 18, 17, 53, DateTimeKind.Utc).AddTicks(3409), new DateTime(2026, 5, 1, 15, 18, 17, 53, DateTimeKind.Utc).AddTicks(3409) });

            migrationBuilder.UpdateData(
                table: "proc_purchase_orders",
                keyColumn: "Id",
                keyValue: new Guid("f2000000-0000-0000-0000-000000000002"),
                columns: new[] { "ApprovedAt", "CreatedAt", "EtaDate" },
                values: new object[] { new DateTime(2026, 4, 23, 15, 18, 17, 53, DateTimeKind.Utc).AddTicks(3409), new DateTime(2026, 4, 22, 15, 18, 17, 53, DateTimeKind.Utc).AddTicks(3409), new DateTime(2026, 4, 29, 15, 18, 17, 53, DateTimeKind.Utc).AddTicks(3409) });

            migrationBuilder.UpdateData(
                table: "proc_receipts",
                keyColumn: "Id",
                keyValue: new Guid("f5000000-0000-0000-0000-000000000001"),
                column: "ReceivedAt",
                value: new DateTime(2026, 4, 25, 15, 18, 17, 53, DateTimeKind.Utc).AddTicks(3409));

            migrationBuilder.UpdateData(
                table: "proc_stock_alerts",
                keyColumn: "Id",
                keyValue: new Guid("f4000000-0000-0000-0000-000000000001"),
                column: "DetectedAt",
                value: new DateTime(2026, 4, 26, 11, 18, 17, 53, DateTimeKind.Utc).AddTicks(3409));

            migrationBuilder.UpdateData(
                table: "proc_stock_alerts",
                keyColumn: "Id",
                keyValue: new Guid("f4000000-0000-0000-0000-000000000002"),
                column: "DetectedAt",
                value: new DateTime(2026, 4, 26, 7, 18, 17, 53, DateTimeKind.Utc).AddTicks(3409));

            migrationBuilder.UpdateData(
                table: "proc_suppliers",
                keyColumn: "Id",
                keyValue: new Guid("f1000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 26, 15, 18, 17, 53, DateTimeKind.Utc).AddTicks(5308));

            migrationBuilder.UpdateData(
                table: "proc_suppliers",
                keyColumn: "Id",
                keyValue: new Guid("f1000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 26, 15, 18, 17, 54, DateTimeKind.Utc).AddTicks(2131));

            migrationBuilder.UpdateData(
                table: "proc_suppliers",
                keyColumn: "Id",
                keyValue: new Guid("f1000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 26, 15, 18, 17, 54, DateTimeKind.Utc).AddTicks(2137));

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "LastActionAt" },
                values: new object[] { new DateTime(2026, 4, 23, 15, 18, 17, 47, DateTimeKind.Utc).AddTicks(6419), new DateTime(2026, 4, 24, 15, 18, 17, 47, DateTimeKind.Utc).AddTicks(6419) });

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "LastActionAt" },
                values: new object[] { new DateTime(2026, 4, 19, 15, 18, 17, 47, DateTimeKind.Utc).AddTicks(6419), new DateTime(2026, 4, 20, 15, 18, 17, 47, DateTimeKind.Utc).AddTicks(6419) });

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "LastActionAt", "ResolvedAt" },
                values: new object[] { new DateTime(2026, 4, 11, 15, 18, 17, 47, DateTimeKind.Utc).AddTicks(6419), new DateTime(2026, 4, 14, 15, 18, 17, 47, DateTimeKind.Utc).AddTicks(6419), new DateTime(2026, 4, 14, 15, 18, 17, 47, DateTimeKind.Utc).AddTicks(6419) });

            migrationBuilder.CreateIndex(
                name: "IX_processed_events_ProcessedAt",
                table: "processed_events",
                column: "ProcessedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "processed_events");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "users");

            migrationBuilder.UpdateData(
                table: "customer_interactions",
                keyColumn: "Id",
                keyValue: new Guid("e1000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 23, 15, 2, 12, 475, DateTimeKind.Utc).AddTicks(7383));

            migrationBuilder.UpdateData(
                table: "customer_interactions",
                keyColumn: "Id",
                keyValue: new Guid("e1000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 22, 15, 2, 12, 475, DateTimeKind.Utc).AddTicks(7383));

            migrationBuilder.UpdateData(
                table: "customer_interactions",
                keyColumn: "Id",
                keyValue: new Guid("e1000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 17, 15, 2, 12, 475, DateTimeKind.Utc).AddTicks(7383));

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2025, 10, 27, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225), new DateTime(2026, 4, 23, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2025, 12, 26, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225), new DateTime(2026, 4, 15, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2026, 4, 15, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225), new DateTime(2026, 4, 17, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000004"),
                columns: new[] { "BlacklistedAt", "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2026, 4, 10, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225), new DateTime(2025, 10, 7, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225), new DateTime(2026, 3, 11, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000005"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2025, 6, 29, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225), new DateTime(2026, 1, 15, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225) });

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 25, 13, 15, 12, 453, DateTimeKind.Utc).AddTicks(9223));

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 25, 14, 39, 12, 453, DateTimeKind.Utc).AddTicks(9223));

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 25, 14, 50, 12, 453, DateTimeKind.Utc).AddTicks(9223));

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000004"),
                columns: new[] { "ConfirmedAt", "CreatedAt" },
                values: new object[] { new DateTime(2026, 4, 25, 13, 2, 12, 453, DateTimeKind.Utc).AddTicks(9223), new DateTime(2026, 4, 25, 12, 2, 12, 453, DateTimeKind.Utc).AddTicks(9223) });

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000005"),
                columns: new[] { "ConfirmedAt", "CreatedAt", "DeliveredAt", "ShippedAt" },
                values: new object[] { new DateTime(2026, 4, 25, 8, 2, 12, 453, DateTimeKind.Utc).AddTicks(9223), new DateTime(2026, 4, 25, 7, 2, 12, 453, DateTimeKind.Utc).AddTicks(9223), new DateTime(2026, 4, 25, 14, 2, 12, 453, DateTimeKind.Utc).AddTicks(9223), new DateTime(2026, 4, 25, 10, 2, 12, 453, DateTimeKind.Utc).AddTicks(9223) });

            migrationBuilder.UpdateData(
                table: "proc_purchase_order_audit_events",
                keyColumn: "Id",
                keyValue: new Guid("f6000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 23, 15, 2, 12, 482, DateTimeKind.Utc).AddTicks(6689));

            migrationBuilder.UpdateData(
                table: "proc_purchase_order_audit_events",
                keyColumn: "Id",
                keyValue: new Guid("f6000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 22, 15, 2, 12, 482, DateTimeKind.Utc).AddTicks(6689));

            migrationBuilder.UpdateData(
                table: "proc_purchase_orders",
                keyColumn: "Id",
                keyValue: new Guid("f2000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "EtaDate" },
                values: new object[] { new DateTime(2026, 4, 23, 15, 2, 12, 482, DateTimeKind.Utc).AddTicks(6689), new DateTime(2026, 4, 30, 15, 2, 12, 482, DateTimeKind.Utc).AddTicks(6689) });

            migrationBuilder.UpdateData(
                table: "proc_purchase_orders",
                keyColumn: "Id",
                keyValue: new Guid("f2000000-0000-0000-0000-000000000002"),
                columns: new[] { "ApprovedAt", "CreatedAt", "EtaDate" },
                values: new object[] { new DateTime(2026, 4, 22, 15, 2, 12, 482, DateTimeKind.Utc).AddTicks(6689), new DateTime(2026, 4, 21, 15, 2, 12, 482, DateTimeKind.Utc).AddTicks(6689), new DateTime(2026, 4, 28, 15, 2, 12, 482, DateTimeKind.Utc).AddTicks(6689) });

            migrationBuilder.UpdateData(
                table: "proc_receipts",
                keyColumn: "Id",
                keyValue: new Guid("f5000000-0000-0000-0000-000000000001"),
                column: "ReceivedAt",
                value: new DateTime(2026, 4, 24, 15, 2, 12, 482, DateTimeKind.Utc).AddTicks(6689));

            migrationBuilder.UpdateData(
                table: "proc_stock_alerts",
                keyColumn: "Id",
                keyValue: new Guid("f4000000-0000-0000-0000-000000000001"),
                column: "DetectedAt",
                value: new DateTime(2026, 4, 25, 11, 2, 12, 482, DateTimeKind.Utc).AddTicks(6689));

            migrationBuilder.UpdateData(
                table: "proc_stock_alerts",
                keyColumn: "Id",
                keyValue: new Guid("f4000000-0000-0000-0000-000000000002"),
                column: "DetectedAt",
                value: new DateTime(2026, 4, 25, 7, 2, 12, 482, DateTimeKind.Utc).AddTicks(6689));

            migrationBuilder.UpdateData(
                table: "proc_suppliers",
                keyColumn: "Id",
                keyValue: new Guid("f1000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 25, 15, 2, 12, 485, DateTimeKind.Utc).AddTicks(227));

            migrationBuilder.UpdateData(
                table: "proc_suppliers",
                keyColumn: "Id",
                keyValue: new Guid("f1000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 25, 15, 2, 12, 490, DateTimeKind.Utc).AddTicks(5693));

            migrationBuilder.UpdateData(
                table: "proc_suppliers",
                keyColumn: "Id",
                keyValue: new Guid("f1000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 25, 15, 2, 12, 490, DateTimeKind.Utc).AddTicks(5753));

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "LastActionAt" },
                values: new object[] { new DateTime(2026, 4, 22, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225), new DateTime(2026, 4, 23, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225) });

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "LastActionAt" },
                values: new object[] { new DateTime(2026, 4, 18, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225), new DateTime(2026, 4, 19, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225) });

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "LastActionAt", "ResolvedAt" },
                values: new object[] { new DateTime(2026, 4, 10, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225), new DateTime(2026, 4, 13, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225), new DateTime(2026, 4, 13, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225) });
        }
    }
}
