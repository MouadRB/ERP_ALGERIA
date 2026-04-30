using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace engine_b.Migrations
{
    /// <inheritdoc />
    public partial class RemoveProcurementSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "proc_purchase_order_audit_events",
                keyColumn: "Id",
                keyValue: new Guid("f6000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "proc_purchase_order_audit_events",
                keyColumn: "Id",
                keyValue: new Guid("f6000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "proc_purchase_order_lines",
                keyColumn: "Id",
                keyValue: new Guid("f3000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "proc_purchase_order_lines",
                keyColumn: "Id",
                keyValue: new Guid("f3000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "proc_receipts",
                keyColumn: "Id",
                keyValue: new Guid("f5000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "proc_stock_alerts",
                keyColumn: "Id",
                keyValue: new Guid("f4000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "proc_stock_alerts",
                keyColumn: "Id",
                keyValue: new Guid("f4000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "proc_suppliers",
                keyColumn: "Id",
                keyValue: new Guid("f1000000-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                table: "proc_purchase_orders",
                keyColumn: "Id",
                keyValue: new Guid("f2000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "proc_purchase_orders",
                keyColumn: "Id",
                keyValue: new Guid("f2000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "proc_suppliers",
                keyColumn: "Id",
                keyValue: new Guid("f1000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "proc_suppliers",
                keyColumn: "Id",
                keyValue: new Guid("f1000000-0000-0000-0000-000000000002"));

            migrationBuilder.UpdateData(
                table: "customer_interactions",
                keyColumn: "Id",
                keyValue: new Guid("e1000000-0000-0000-0000-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 27, 16, 40, 37, 989, DateTimeKind.Utc).AddTicks(5023));

            migrationBuilder.UpdateData(
                table: "customer_interactions",
                keyColumn: "Id",
                keyValue: new Guid("e1000000-0000-0000-0000-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 26, 16, 40, 37, 989, DateTimeKind.Utc).AddTicks(5023));

            migrationBuilder.UpdateData(
                table: "customer_interactions",
                keyColumn: "Id",
                keyValue: new Guid("e1000000-0000-0000-0000-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 21, 16, 40, 37, 989, DateTimeKind.Utc).AddTicks(5023));

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2025, 10, 31, 16, 40, 37, 986, DateTimeKind.Utc).AddTicks(7570), new DateTime(2026, 4, 27, 16, 40, 37, 986, DateTimeKind.Utc).AddTicks(7570) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2025, 12, 30, 16, 40, 37, 986, DateTimeKind.Utc).AddTicks(7570), new DateTime(2026, 4, 19, 16, 40, 37, 986, DateTimeKind.Utc).AddTicks(7570) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2026, 4, 19, 16, 40, 37, 986, DateTimeKind.Utc).AddTicks(7570), new DateTime(2026, 4, 21, 16, 40, 37, 986, DateTimeKind.Utc).AddTicks(7570) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000004"),
                columns: new[] { "BlacklistedAt", "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2026, 4, 14, 16, 40, 37, 986, DateTimeKind.Utc).AddTicks(7570), new DateTime(2025, 10, 11, 16, 40, 37, 986, DateTimeKind.Utc).AddTicks(7570), new DateTime(2026, 3, 15, 16, 40, 37, 986, DateTimeKind.Utc).AddTicks(7570) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000005"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2025, 7, 3, 16, 40, 37, 986, DateTimeKind.Utc).AddTicks(7570), new DateTime(2026, 1, 19, 16, 40, 37, 986, DateTimeKind.Utc).AddTicks(7570) });

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000001"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 29, 14, 53, 37, 983, DateTimeKind.Utc).AddTicks(5970));

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000002"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 29, 16, 17, 37, 983, DateTimeKind.Utc).AddTicks(5970));

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000003"),
                column: "CreatedAt",
                value: new DateTime(2026, 4, 29, 16, 28, 37, 983, DateTimeKind.Utc).AddTicks(5970));

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000004"),
                columns: new[] { "ConfirmedAt", "CreatedAt" },
                values: new object[] { new DateTime(2026, 4, 29, 14, 40, 37, 983, DateTimeKind.Utc).AddTicks(5970), new DateTime(2026, 4, 29, 13, 40, 37, 983, DateTimeKind.Utc).AddTicks(5970) });

            migrationBuilder.UpdateData(
                table: "orders",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-0001-0001-0001-000000000005"),
                columns: new[] { "ConfirmedAt", "CreatedAt", "DeliveredAt", "ShippedAt" },
                values: new object[] { new DateTime(2026, 4, 29, 9, 40, 37, 983, DateTimeKind.Utc).AddTicks(5970), new DateTime(2026, 4, 29, 8, 40, 37, 983, DateTimeKind.Utc).AddTicks(5970), new DateTime(2026, 4, 29, 15, 40, 37, 983, DateTimeKind.Utc).AddTicks(5970), new DateTime(2026, 4, 29, 11, 40, 37, 983, DateTimeKind.Utc).AddTicks(5970) });

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "LastActionAt" },
                values: new object[] { new DateTime(2026, 4, 26, 16, 40, 37, 986, DateTimeKind.Utc).AddTicks(7570), new DateTime(2026, 4, 27, 16, 40, 37, 986, DateTimeKind.Utc).AddTicks(7570) });

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "LastActionAt" },
                values: new object[] { new DateTime(2026, 4, 22, 16, 40, 37, 986, DateTimeKind.Utc).AddTicks(7570), new DateTime(2026, 4, 23, 16, 40, 37, 986, DateTimeKind.Utc).AddTicks(7570) });

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "LastActionAt", "ResolvedAt" },
                values: new object[] { new DateTime(2026, 4, 14, 16, 40, 37, 986, DateTimeKind.Utc).AddTicks(7570), new DateTime(2026, 4, 17, 16, 40, 37, 986, DateTimeKind.Utc).AddTicks(7570), new DateTime(2026, 4, 17, 16, 40, 37, 986, DateTimeKind.Utc).AddTicks(7570) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.InsertData(
                table: "proc_stock_alerts",
                columns: new[] { "Id", "AvailableUnits", "DetectedAt", "IsResolved", "ProductName", "ReorderThreshold", "Severity", "Sku", "SuggestedOrderQty", "SupplierName" },
                values: new object[,]
                {
                    { new Guid("f4000000-0000-0000-0000-000000000001"), 0, new DateTime(2026, 4, 27, 19, 27, 46, 979, DateTimeKind.Utc).AddTicks(9134), false, "Apple AirPods Pro 2ème Génération", 25, 2, "SKU-851", 50, "Apple Distribution" },
                    { new Guid("f4000000-0000-0000-0000-000000000002"), 5, new DateTime(2026, 4, 27, 15, 27, 46, 979, DateTimeKind.Utc).AddTicks(9134), false, "Nike Air Max 90", 10, 1, "SKU-818", 12, "Nike MENA" }
                });

            migrationBuilder.InsertData(
                table: "proc_suppliers",
                columns: new[] { "Id", "AverageCostIndex", "City", "ContactName", "Country", "CreatedAt", "Email", "LeadTimeDays", "Name", "OnTimeRate", "Phone", "ReliabilityScore" },
                values: new object[,]
                {
                    { new Guid("f1000000-0000-0000-0000-000000000001"), 100m, "Paris", "Jean-Pierre Martin", "France", new DateTime(2026, 4, 27, 23, 27, 46, 980, DateTimeKind.Utc).AddTicks(3467), "jp@apple-dist.fr", 5, "Apple Distribution", 76m, "+33 1 00 00 00 00", 67m },
                    { new Guid("f1000000-0000-0000-0000-000000000002"), 98m, "Dubai", "M. Karim Hassan", "UAE", new DateTime(2026, 4, 27, 23, 27, 46, 981, DateTimeKind.Utc).AddTicks(9060), "karim@nike-mena.ae", 7, "Nike MENA", 92m, "+971 50 000 00 00", 94m },
                    { new Guid("f1000000-0000-0000-0000-000000000003"), 101m, "Seoul", "A. Mehdi Khan", "Korea", new DateTime(2026, 4, 27, 23, 27, 46, 981, DateTimeKind.Utc).AddTicks(9081), "mehdi@samsung.co.kr", 6, "Samsung Electronics", 83m, "+82 2 0000 0000", 78m }
                });

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

            migrationBuilder.InsertData(
                table: "proc_purchase_orders",
                columns: new[] { "Id", "ApprovedAt", "ApprovedBy", "BudgetAvailable", "CreatedAt", "CreatedBy", "Currency", "CustomsCost", "EtaDate", "Notes", "Priority", "ReceivedAt", "Reference", "SentAt", "SodRule", "Status", "Subtotal", "SupplierId", "TotalAmount", "TransportCost", "Warehouse" },
                values: new object[,]
                {
                    { new Guid("f2000000-0000-0000-0000-000000000001"), null, null, 750000m, new DateTime(2026, 4, 25, 23, 27, 46, 979, DateTimeKind.Utc).AddTicks(9134), "Procurement Manager", "DZD", 0m, new DateTime(2026, 5, 2, 23, 27, 46, 979, DateTimeKind.Utc).AddTicks(9134), null, 1, null, "BC-897", null, "PM cannot self-approve", 1, 900000m, new Guid("f1000000-0000-0000-0000-000000000001"), 900000m, 0m, "Alger WH-01" },
                    { new Guid("f2000000-0000-0000-0000-000000000002"), new DateTime(2026, 4, 24, 23, 27, 46, 979, DateTimeKind.Utc).AddTicks(9134), "SuperAdmin", 420000m, new DateTime(2026, 4, 23, 23, 27, 46, 979, DateTimeKind.Utc).AddTicks(9134), "Procurement Manager", "DZD", 0m, new DateTime(2026, 4, 30, 23, 27, 46, 979, DateTimeKind.Utc).AddTicks(9134), null, 2, null, "BC-892", null, "PM cannot self-approve", 2, 264000m, new Guid("f1000000-0000-0000-0000-000000000002"), 264000m, 0m, "Alger WH-01" }
                });

            migrationBuilder.InsertData(
                table: "proc_purchase_order_audit_events",
                columns: new[] { "Id", "Actor", "CreatedAt", "EventType", "Message", "PurchaseOrderId" },
                values: new object[,]
                {
                    { new Guid("f6000000-0000-0000-0000-000000000001"), "Procurement Manager", new DateTime(2026, 4, 25, 23, 27, 46, 979, DateTimeKind.Utc).AddTicks(9134), "created", "BC-897 created and submitted for approval.", new Guid("f2000000-0000-0000-0000-000000000001") },
                    { new Guid("f6000000-0000-0000-0000-000000000002"), "SuperAdmin", new DateTime(2026, 4, 24, 23, 27, 46, 979, DateTimeKind.Utc).AddTicks(9134), "approved", "BC-892 approved by SuperAdmin.", new Guid("f2000000-0000-0000-0000-000000000002") }
                });

            migrationBuilder.InsertData(
                table: "proc_purchase_order_lines",
                columns: new[] { "Id", "ProductName", "PurchaseOrderId", "Quantity", "ReceivedQuantity", "Sku", "Subtotal", "UnitPrice" },
                values: new object[,]
                {
                    { new Guid("f3000000-0000-0000-0000-000000000001"), "Apple AirPods Pro 2", new Guid("f2000000-0000-0000-0000-000000000001"), 50, 0, "SKU-851", 900000m, 18000m },
                    { new Guid("f3000000-0000-0000-0000-000000000002"), "Nike Air Max 90", new Guid("f2000000-0000-0000-0000-000000000002"), 62, 0, "SKU-812", 264000m, 4258.06m }
                });

            migrationBuilder.InsertData(
                table: "proc_receipts",
                columns: new[] { "Id", "PurchaseOrderId", "ReceiptNumber", "ReceivedAt", "ReceivedBy", "TotalReceivedValue", "UnitsReceived" },
                values: new object[] { new Guid("f5000000-0000-0000-0000-000000000001"), new Guid("f2000000-0000-0000-0000-000000000002"), "REC-892-1", new DateTime(2026, 4, 26, 23, 27, 46, 979, DateTimeKind.Utc).AddTicks(9134), "Inventory Manager", 264000m, 62 });
        }
    }
}
