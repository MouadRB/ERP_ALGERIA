using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace engine_b.Migrations
{
    /// <inheritdoc />
    public partial class FinanceModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DeliveryAddress",
                table: "customers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreferredChannel",
                table: "customers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreferredLanguage",
                table: "customers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SecondaryPhone",
                table: "customers",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "accounting_periods",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    LockedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LockedBy = table.Column<string>(type: "text", nullable: true),
                    ClosedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ClosedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_accounting_periods", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "fifo_layers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Sku = table.Column<string>(type: "text", nullable: false),
                    ProductName = table.Column<string>(type: "text", nullable: false),
                    Warehouse = table.Column<string>(type: "text", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitCost = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    PurchaseOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReceivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_fifo_layers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "invoices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InvoiceNumber = table.Column<string>(type: "text", nullable: false),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    OrderNumber = table.Column<string>(type: "text", nullable: false),
                    CustomerName = table.Column<string>(type: "text", nullable: false),
                    CustomerPhone = table.Column<string>(type: "text", nullable: false),
                    Wilaya = table.Column<int>(type: "integer", nullable: false),
                    Subtotal = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    TaxRate = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    TaxAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IssuedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IssuedBy = table.Column<string>(type: "text", nullable: true),
                    PaidAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PaidBy = table.Column<string>(type: "text", nullable: true),
                    VoidedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    VoidedBy = table.Column<string>(type: "text", nullable: true),
                    VoidReason = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_invoices", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "outbox_messages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EventType = table.Column<string>(type: "text", nullable: false),
                    AggregateType = table.Column<string>(type: "text", nullable: false),
                    AggregateId = table.Column<string>(type: "text", nullable: false),
                    Payload = table.Column<string>(type: "text", nullable: false),
                    OccurredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Error = table.Column<string>(type: "text", nullable: true),
                    RetryCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_outbox_messages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "proc_stock_alerts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductName = table.Column<string>(type: "text", nullable: false),
                    Sku = table.Column<string>(type: "text", nullable: false),
                    AvailableUnits = table.Column<int>(type: "integer", nullable: false),
                    ReorderThreshold = table.Column<int>(type: "integer", nullable: false),
                    SuggestedOrderQty = table.Column<int>(type: "integer", nullable: false),
                    SupplierName = table.Column<string>(type: "text", nullable: false),
                    Severity = table.Column<int>(type: "integer", nullable: false),
                    IsResolved = table.Column<bool>(type: "boolean", nullable: false),
                    DetectedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_proc_stock_alerts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "proc_suppliers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Country = table.Column<string>(type: "text", nullable: false),
                    City = table.Column<string>(type: "text", nullable: false),
                    ContactName = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Phone = table.Column<string>(type: "text", nullable: false),
                    LeadTimeDays = table.Column<int>(type: "integer", nullable: false),
                    ReliabilityScore = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    OnTimeRate = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    AverageCostIndex = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_proc_suppliers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "journal_entries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EntryNumber = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    DebitAccount = table.Column<string>(type: "text", nullable: false),
                    CreditAccount = table.Column<string>(type: "text", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    EntryType = table.Column<int>(type: "integer", nullable: false),
                    PeriodId = table.Column<Guid>(type: "uuid", nullable: false),
                    InvoiceId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_journal_entries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_journal_entries_accounting_periods_PeriodId",
                        column: x => x.PeriodId,
                        principalTable: "accounting_periods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_journal_entries_invoices_InvoiceId",
                        column: x => x.InvoiceId,
                        principalTable: "invoices",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "proc_purchase_orders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Reference = table.Column<string>(type: "text", nullable: false),
                    SupplierId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    SodRule = table.Column<string>(type: "text", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    ApprovedBy = table.Column<string>(type: "text", nullable: true),
                    Warehouse = table.Column<string>(type: "text", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    TransportCost = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CustomsCost = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Subtotal = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    BudgetAvailable = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EtaDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReceivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_proc_purchase_orders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_proc_purchase_orders_proc_suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalTable: "proc_suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "proc_purchase_order_audit_events",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PurchaseOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    EventType = table.Column<string>(type: "text", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    Actor = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_proc_purchase_order_audit_events", x => x.Id);
                    table.ForeignKey(
                        name: "FK_proc_purchase_order_audit_events_proc_purchase_orders_Purch~",
                        column: x => x.PurchaseOrderId,
                        principalTable: "proc_purchase_orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "proc_purchase_order_lines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PurchaseOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    Sku = table.Column<string>(type: "text", nullable: false),
                    ProductName = table.Column<string>(type: "text", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Subtotal = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ReceivedQuantity = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_proc_purchase_order_lines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_proc_purchase_order_lines_proc_purchase_orders_PurchaseOrde~",
                        column: x => x.PurchaseOrderId,
                        principalTable: "proc_purchase_orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "proc_receipts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PurchaseOrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReceiptNumber = table.Column<string>(type: "text", nullable: false),
                    UnitsReceived = table.Column<int>(type: "integer", nullable: false),
                    TotalReceivedValue = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ReceivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReceivedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_proc_receipts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_proc_receipts_proc_purchase_orders_PurchaseOrderId",
                        column: x => x.PurchaseOrderId,
                        principalTable: "proc_purchase_orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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
                columns: new[] { "CreatedAt", "DeliveryAddress", "LastOrderDate", "PreferredChannel", "PreferredLanguage", "SecondaryPhone" },
                values: new object[] { new DateTime(2025, 10, 27, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225), null, new DateTime(2026, 4, 23, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225), null, null, null });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "DeliveryAddress", "LastOrderDate", "PreferredChannel", "PreferredLanguage", "SecondaryPhone" },
                values: new object[] { new DateTime(2025, 12, 26, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225), null, new DateTime(2026, 4, 15, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225), null, null, null });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "DeliveryAddress", "LastOrderDate", "PreferredChannel", "PreferredLanguage", "SecondaryPhone" },
                values: new object[] { new DateTime(2026, 4, 15, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225), null, new DateTime(2026, 4, 17, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225), null, null, null });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000004"),
                columns: new[] { "BlacklistedAt", "CreatedAt", "DeliveryAddress", "LastOrderDate", "PreferredChannel", "PreferredLanguage", "SecondaryPhone" },
                values: new object[] { new DateTime(2026, 4, 10, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225), new DateTime(2025, 10, 7, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225), null, new DateTime(2026, 3, 11, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225), null, null, null });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000005"),
                columns: new[] { "CreatedAt", "DeliveryAddress", "LastOrderDate", "PreferredChannel", "PreferredLanguage", "SecondaryPhone" },
                values: new object[] { new DateTime(2025, 6, 29, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225), null, new DateTime(2026, 1, 15, 15, 2, 12, 467, DateTimeKind.Utc).AddTicks(8225), null, null, null });

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

            migrationBuilder.InsertData(
                table: "proc_stock_alerts",
                columns: new[] { "Id", "AvailableUnits", "DetectedAt", "IsResolved", "ProductName", "ReorderThreshold", "Severity", "Sku", "SuggestedOrderQty", "SupplierName" },
                values: new object[,]
                {
                    { new Guid("f4000000-0000-0000-0000-000000000001"), 0, new DateTime(2026, 4, 25, 11, 2, 12, 482, DateTimeKind.Utc).AddTicks(6689), false, "Apple AirPods Pro 2ème Génération", 25, 2, "SKU-851", 50, "Apple Distribution" },
                    { new Guid("f4000000-0000-0000-0000-000000000002"), 5, new DateTime(2026, 4, 25, 7, 2, 12, 482, DateTimeKind.Utc).AddTicks(6689), false, "Nike Air Max 90", 10, 1, "SKU-818", 12, "Nike MENA" }
                });

            migrationBuilder.InsertData(
                table: "proc_suppliers",
                columns: new[] { "Id", "AverageCostIndex", "City", "ContactName", "Country", "CreatedAt", "Email", "LeadTimeDays", "Name", "OnTimeRate", "Phone", "ReliabilityScore" },
                values: new object[,]
                {
                    { new Guid("f1000000-0000-0000-0000-000000000001"), 100m, "Paris", "Jean-Pierre Martin", "France", new DateTime(2026, 4, 25, 15, 2, 12, 485, DateTimeKind.Utc).AddTicks(227), "jp@apple-dist.fr", 5, "Apple Distribution", 76m, "+33 1 00 00 00 00", 67m },
                    { new Guid("f1000000-0000-0000-0000-000000000002"), 98m, "Dubai", "M. Karim Hassan", "UAE", new DateTime(2026, 4, 25, 15, 2, 12, 490, DateTimeKind.Utc).AddTicks(5693), "karim@nike-mena.ae", 7, "Nike MENA", 92m, "+971 50 000 00 00", 94m },
                    { new Guid("f1000000-0000-0000-0000-000000000003"), 101m, "Seoul", "A. Mehdi Khan", "Korea", new DateTime(2026, 4, 25, 15, 2, 12, 490, DateTimeKind.Utc).AddTicks(5753), "mehdi@samsung.co.kr", 6, "Samsung Electronics", 83m, "+82 2 0000 0000", 78m }
                });

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

            migrationBuilder.InsertData(
                table: "proc_purchase_orders",
                columns: new[] { "Id", "ApprovedAt", "ApprovedBy", "BudgetAvailable", "CreatedAt", "CreatedBy", "Currency", "CustomsCost", "EtaDate", "Notes", "Priority", "ReceivedAt", "Reference", "SentAt", "SodRule", "Status", "Subtotal", "SupplierId", "TotalAmount", "TransportCost", "Warehouse" },
                values: new object[,]
                {
                    { new Guid("f2000000-0000-0000-0000-000000000001"), null, null, 750000m, new DateTime(2026, 4, 23, 15, 2, 12, 482, DateTimeKind.Utc).AddTicks(6689), "Procurement Manager", "DZD", 0m, new DateTime(2026, 4, 30, 15, 2, 12, 482, DateTimeKind.Utc).AddTicks(6689), null, 1, null, "BC-897", null, "PM cannot self-approve", 1, 900000m, new Guid("f1000000-0000-0000-0000-000000000001"), 900000m, 0m, "Alger WH-01" },
                    { new Guid("f2000000-0000-0000-0000-000000000002"), new DateTime(2026, 4, 22, 15, 2, 12, 482, DateTimeKind.Utc).AddTicks(6689), "SuperAdmin", 420000m, new DateTime(2026, 4, 21, 15, 2, 12, 482, DateTimeKind.Utc).AddTicks(6689), "Procurement Manager", "DZD", 0m, new DateTime(2026, 4, 28, 15, 2, 12, 482, DateTimeKind.Utc).AddTicks(6689), null, 2, null, "BC-892", null, "PM cannot self-approve", 2, 264000m, new Guid("f1000000-0000-0000-0000-000000000002"), 264000m, 0m, "Alger WH-01" }
                });

            migrationBuilder.InsertData(
                table: "proc_purchase_order_audit_events",
                columns: new[] { "Id", "Actor", "CreatedAt", "EventType", "Message", "PurchaseOrderId" },
                values: new object[,]
                {
                    { new Guid("f6000000-0000-0000-0000-000000000001"), "Procurement Manager", new DateTime(2026, 4, 23, 15, 2, 12, 482, DateTimeKind.Utc).AddTicks(6689), "created", "BC-897 created and submitted for approval.", new Guid("f2000000-0000-0000-0000-000000000001") },
                    { new Guid("f6000000-0000-0000-0000-000000000002"), "SuperAdmin", new DateTime(2026, 4, 22, 15, 2, 12, 482, DateTimeKind.Utc).AddTicks(6689), "approved", "BC-892 approved by SuperAdmin.", new Guid("f2000000-0000-0000-0000-000000000002") }
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
                values: new object[] { new Guid("f5000000-0000-0000-0000-000000000001"), new Guid("f2000000-0000-0000-0000-000000000002"), "REC-892-1", new DateTime(2026, 4, 24, 15, 2, 12, 482, DateTimeKind.Utc).AddTicks(6689), "Inventory Manager", 264000m, 62 });

            migrationBuilder.CreateIndex(
                name: "IX_accounting_periods_Name",
                table: "accounting_periods",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_fifo_layers_Sku",
                table: "fifo_layers",
                column: "Sku");

            migrationBuilder.CreateIndex(
                name: "IX_fifo_layers_Warehouse",
                table: "fifo_layers",
                column: "Warehouse");

            migrationBuilder.CreateIndex(
                name: "IX_invoices_InvoiceNumber",
                table: "invoices",
                column: "InvoiceNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_invoices_OrderNumber",
                table: "invoices",
                column: "OrderNumber");

            migrationBuilder.CreateIndex(
                name: "IX_journal_entries_EntryNumber",
                table: "journal_entries",
                column: "EntryNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_journal_entries_InvoiceId",
                table: "journal_entries",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_journal_entries_PeriodId",
                table: "journal_entries",
                column: "PeriodId");

            migrationBuilder.CreateIndex(
                name: "IX_outbox_messages_OccurredAt",
                table: "outbox_messages",
                column: "OccurredAt");

            migrationBuilder.CreateIndex(
                name: "IX_outbox_messages_ProcessedAt",
                table: "outbox_messages",
                column: "ProcessedAt");

            migrationBuilder.CreateIndex(
                name: "IX_outbox_messages_ProcessedAt_RetryCount",
                table: "outbox_messages",
                columns: new[] { "ProcessedAt", "RetryCount" });

            migrationBuilder.CreateIndex(
                name: "IX_proc_purchase_order_audit_events_CreatedAt",
                table: "proc_purchase_order_audit_events",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_proc_purchase_order_audit_events_PurchaseOrderId",
                table: "proc_purchase_order_audit_events",
                column: "PurchaseOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_proc_purchase_order_lines_PurchaseOrderId",
                table: "proc_purchase_order_lines",
                column: "PurchaseOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_proc_purchase_orders_Reference",
                table: "proc_purchase_orders",
                column: "Reference",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_proc_purchase_orders_Status",
                table: "proc_purchase_orders",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_proc_purchase_orders_SupplierId",
                table: "proc_purchase_orders",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_proc_receipts_PurchaseOrderId",
                table: "proc_receipts",
                column: "PurchaseOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_proc_stock_alerts_IsResolved",
                table: "proc_stock_alerts",
                column: "IsResolved");

            migrationBuilder.CreateIndex(
                name: "IX_proc_stock_alerts_Severity",
                table: "proc_stock_alerts",
                column: "Severity");

            migrationBuilder.CreateIndex(
                name: "IX_proc_suppliers_Name",
                table: "proc_suppliers",
                column: "Name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "fifo_layers");

            migrationBuilder.DropTable(
                name: "journal_entries");

            migrationBuilder.DropTable(
                name: "outbox_messages");

            migrationBuilder.DropTable(
                name: "proc_purchase_order_audit_events");

            migrationBuilder.DropTable(
                name: "proc_purchase_order_lines");

            migrationBuilder.DropTable(
                name: "proc_receipts");

            migrationBuilder.DropTable(
                name: "proc_stock_alerts");

            migrationBuilder.DropTable(
                name: "accounting_periods");

            migrationBuilder.DropTable(
                name: "invoices");

            migrationBuilder.DropTable(
                name: "proc_purchase_orders");

            migrationBuilder.DropTable(
                name: "proc_suppliers");

            migrationBuilder.DropColumn(
                name: "DeliveryAddress",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "PreferredChannel",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "PreferredLanguage",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "SecondaryPhone",
                table: "customers");

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
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2025, 10, 15, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805), new DateTime(2026, 4, 11, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2025, 12, 14, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805), new DateTime(2026, 4, 3, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2026, 4, 3, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805), new DateTime(2026, 4, 5, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000004"),
                columns: new[] { "BlacklistedAt", "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2026, 3, 29, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805), new DateTime(2025, 9, 25, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805), new DateTime(2026, 2, 27, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805) });

            migrationBuilder.UpdateData(
                table: "customers",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000005"),
                columns: new[] { "CreatedAt", "LastOrderDate" },
                values: new object[] { new DateTime(2025, 6, 17, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805), new DateTime(2026, 1, 3, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805) });

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
                columns: new[] { "CreatedAt", "LastActionAt" },
                values: new object[] { new DateTime(2026, 4, 10, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805), new DateTime(2026, 4, 11, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805) });

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "LastActionAt" },
                values: new object[] { new DateTime(2026, 4, 6, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805), new DateTime(2026, 4, 7, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805) });

            migrationBuilder.UpdateData(
                table: "support_tickets",
                keyColumn: "Id",
                keyValue: new Guid("d1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "LastActionAt", "ResolvedAt" },
                values: new object[] { new DateTime(2026, 3, 29, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805), new DateTime(2026, 4, 1, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805), new DateTime(2026, 4, 1, 18, 9, 15, 495, DateTimeKind.Utc).AddTicks(6805) });
        }
    }
}
