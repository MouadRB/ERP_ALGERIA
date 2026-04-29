using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace engine_b.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantInvitations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "tenant_invitations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    RolesCsv = table.Column<string>(type: "text", nullable: false),
                    TokenHash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AcceptedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InvitedByUserId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tenant_invitations", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "customer_interactions",
                keyColumn: "Id",
                keyValue: new Guid("e1000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 25, 23, 27, 46, 973, DateTimeKind.Utc).AddTicks(7454));

            migrationBuilder.UpdateData(
                table: "customer_interactions",
                keyColumn: "Id",
                keyValue: new Guid("e1000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 24, 23, 27, 46, 973, DateTimeKind.Utc).AddTicks(7454));

            migrationBuilder.UpdateData(
                table: "customer_interactions",
                keyColumn: "Id",
                keyValue: new Guid("e1000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 19, 23, 27, 46, 973, DateTimeKind.Utc).AddTicks(7454));

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2025, 10, 29, 23, 27, 46, 967, DateTimeKind.Utc).AddTicks(4225), new DateTime(2026, 4, 25, 23, 27, 46, 967, DateTimeKind.Utc).AddTicks(4225) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2025, 12, 28, 23, 27, 46, 967, DateTimeKind.Utc).AddTicks(4225), new DateTime(2026, 4, 17, 23, 27, 46, 967, DateTimeKind.Utc).AddTicks(4225) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2026, 4, 17, 23, 27, 46, 967, DateTimeKind.Utc).AddTicks(4225), new DateTime(2026, 4, 19, 23, 27, 46, 967, DateTimeKind.Utc).AddTicks(4225) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000004"),
                columns: new[] { "BlacklistedAt", "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2026, 4, 12, 23, 27, 46, 967, DateTimeKind.Utc).AddTicks(4225), new DateTime(2025, 10, 9, 23, 27, 46, 967, DateTimeKind.Utc).AddTicks(4225), new DateTime(2026, 3, 13, 23, 27, 46, 967, DateTimeKind.Utc).AddTicks(4225) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000005"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2025, 7, 1, 23, 27, 46, 967, DateTimeKind.Utc).AddTicks(4225), new DateTime(2026, 1, 17, 23, 27, 46, 967, DateTimeKind.Utc).AddTicks(4225) });

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 27, 21, 40, 46, 958, DateTimeKind.Utc).AddTicks(4770));

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 27, 23, 4, 46, 958, DateTimeKind.Utc).AddTicks(4770));

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 27, 23, 15, 46, 958, DateTimeKind.Utc).AddTicks(4770));

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000004"),
                columns: new[] { "ConfirmedAt", "CreatedAt" },
                values: new object[] { new DateTime(2026, 4, 27, 21, 27, 46, 958, DateTimeKind.Utc).AddTicks(4770), new DateTime(2026, 4, 27, 20, 27, 46, 958, DateTimeKind.Utc).AddTicks(4770) });

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000005"),
                columns: new[] { "ConfirmedAt", "CreatedAt", "DeliveredAt", "ShippedAt" },
                values: new object[] { new DateTime(2026, 4, 27, 16, 27, 46, 958, DateTimeKind.Utc).AddTicks(4770), new DateTime(2026, 4, 27, 15, 27, 46, 958, DateTimeKind.Utc).AddTicks(4770), new DateTime(2026, 4, 27, 22, 27, 46, 958, DateTimeKind.Utc).AddTicks(4770), new DateTime(2026, 4, 27, 18, 27, 46, 958, DateTimeKind.Utc).AddTicks(4770) });

            migrationBuilder.UpdateData(
                table: "proc_purchase_order_audit_events",
                keyColumn: "Id",
                keyValue: new Guid("f6000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 25, 23, 27, 46, 979, DateTimeKind.Utc).AddTicks(9134));

            migrationBuilder.UpdateData(
                table: "proc_purchase_order_audit_events",
                keyColumn: "Id",
                keyValue: new Guid("f6000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 24, 23, 27, 46, 979, DateTimeKind.Utc).AddTicks(9134));

            migrationBuilder.UpdateData(
                table: "proc_purchase_orders",
                keyColumn: "Id",
                keyValue: new Guid("f2000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "EtaDate" },
                values: new object[] { new DateTime(2026, 4, 25, 23, 27, 46, 979, DateTimeKind.Utc).AddTicks(9134), new DateTime(2026, 5, 2, 23, 27, 46, 979, DateTimeKind.Utc).AddTicks(9134) });

            migrationBuilder.UpdateData(
                table: "proc_purchase_orders",
                keyColumn: "Id",
                keyValue: new Guid("f2000000-0000-0000-0000-000000000002"),
                columns: new[] { "ApprovedAt", "CreatedAt", "EtaDate" },
                values: new object[] { new DateTime(2026, 4, 24, 23, 27, 46, 979, DateTimeKind.Utc).AddTicks(9134), new DateTime(2026, 4, 23, 23, 27, 46, 979, DateTimeKind.Utc).AddTicks(9134), new DateTime(2026, 4, 30, 23, 27, 46, 979, DateTimeKind.Utc).AddTicks(9134) });

            migrationBuilder.UpdateData(
                table: "proc_receipts",
                keyColumn: "Id",
                keyValue: new Guid("f5000000-0000-0000-0000-000000000001"),
                column: "ReceivedAt",
                value: new DateTime(2026, 4, 26, 23, 27, 46, 979, DateTimeKind.Utc).AddTicks(9134));

            migrationBuilder.UpdateData(
                table: "proc_stock_alerts",
                keyColumn: "Id",
                keyValue: new Guid("f4000000-0000-0000-0000-000000000001"),
                column: "DetectedAt",
                value: new DateTime(2026, 4, 27, 19, 27, 46, 979, DateTimeKind.Utc).AddTicks(9134));

            migrationBuilder.UpdateData(
                table: "proc_stock_alerts",
                keyColumn: "Id",
                keyValue: new Guid("f4000000-0000-0000-0000-000000000002"),
                column: "DetectedAt",
                value: new DateTime(2026, 4, 27, 15, 27, 46, 979, DateTimeKind.Utc).AddTicks(9134));

            migrationBuilder.UpdateData(
                table: "proc_suppliers",
                keyColumn: "Id",
                keyValue: new Guid("f1000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 27, 23, 27, 46, 980, DateTimeKind.Utc).AddTicks(3467));

            migrationBuilder.UpdateData(
                table: "proc_suppliers",
                keyColumn: "Id",
                keyValue: new Guid("f1000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 27, 23, 27, 46, 981, DateTimeKind.Utc).AddTicks(9060));

            migrationBuilder.UpdateData(
                table: "proc_suppliers",
                keyColumn: "Id",
                keyValue: new Guid("f1000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 27, 23, 27, 46, 981, DateTimeKind.Utc).AddTicks(9081));

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "LastActionAt" },
                values: new object[] { new DateTime(2026, 4, 24, 23, 27, 46, 967, DateTimeKind.Utc).AddTicks(4225), new DateTime(2026, 4, 25, 23, 27, 46, 967, DateTimeKind.Utc).AddTicks(4225) });

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "LastActionAt" },
                values: new object[] { new DateTime(2026, 4, 20, 23, 27, 46, 967, DateTimeKind.Utc).AddTicks(4225), new DateTime(2026, 4, 21, 23, 27, 46, 967, DateTimeKind.Utc).AddTicks(4225) });

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "LastActionAt", "ResolvedAt" },
                values: new object[] { new DateTime(2026, 4, 12, 23, 27, 46, 967, DateTimeKind.Utc).AddTicks(4225), new DateTime(2026, 4, 15, 23, 27, 46, 967, DateTimeKind.Utc).AddTicks(4225), new DateTime(2026, 4, 15, 23, 27, 46, 967, DateTimeKind.Utc).AddTicks(4225) });

            migrationBuilder.CreateIndex(
                name: "IX_tenant_invitations_ExpiresAt",
                table: "tenant_invitations",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_tenant_invitations_TenantId_Email",
                table: "tenant_invitations",
                columns: new[] { "TenantId", "Email" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tenant_invitations");

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
        }
    }
}
