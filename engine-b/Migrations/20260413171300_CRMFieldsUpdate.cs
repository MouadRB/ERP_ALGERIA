using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace engine_b.Migrations
{
    /// <inheritdoc />
    public partial class CRMFieldsUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "customers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    Phone = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: true),
                    Wilaya = table.Column<int>(type: "integer", nullable: false),
                    City = table.Column<string>(type: "text", nullable: false),
                    TotalOrders = table.Column<int>(type: "integer", nullable: false),
                    TotalRevenue = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ReturnRate = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    Segment = table.Column<int>(type: "integer", nullable: false),
                    RiskLevel = table.Column<int>(type: "integer", nullable: false),
                    RiskScore = table.Column<int>(type: "integer", nullable: false),
                    IsBlacklisted = table.Column<bool>(type: "boolean", nullable: false),
                    BlacklistReason = table.Column<string>(type: "text", nullable: true),
                    BlacklistedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    BlacklistedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastOrderDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_customers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "orders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderNumber = table.Column<string>(type: "text", nullable: false),
                    ClientPhone = table.Column<string>(type: "text", nullable: false),
                    ClientName = table.Column<string>(type: "text", nullable: false),
                    Wilaya = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Risk = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ConfirmedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ShippedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeliveredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsNewClient = table.Column<bool>(type: "boolean", nullable: false),
                    ClientOrderCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_orders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "roles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "stock_alerts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductName = table.Column<string>(type: "text", nullable: false),
                    Sku = table.Column<string>(type: "text", nullable: false),
                    CurrentStock = table.Column<int>(type: "integer", nullable: false),
                    DetectedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsResolved = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_stock_alerts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: true),
                    SecurityStamp = table.Column<string>(type: "text", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "support_tickets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    TicketNumber = table.Column<string>(type: "text", nullable: false),
                    Subject = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    RelatedOrderId = table.Column<string>(type: "text", nullable: true),
                    AssignedAgentName = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastActionAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ResolvedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_support_tickets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_support_tickets_customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "role_claims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClaimType = table.Column<string>(type: "text", nullable: true),
                    ClaimValue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_role_claims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_role_claims_roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_claims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClaimType = table.Column<string>(type: "text", nullable: true),
                    ClaimValue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_claims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_user_claims_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_logins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "text", nullable: false),
                    ProviderKey = table.Column<string>(type: "text", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_logins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_user_logins_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_roles",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_roles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_user_roles_roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_roles_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_tokens",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LoginProvider = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_tokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_user_tokens_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "customers",
                columns: new[] { "Id", "BlacklistReason", "BlacklistedAt", "BlacklistedBy", "City", "CreatedAt", "Email", "FullName", "IsBlacklisted", "LastOrderDate", "Phone", "ReturnRate", "RiskLevel", "RiskScore", "Segment", "TotalOrders", "TotalRevenue", "Wilaya" },
                values: new object[,]
                {
                    { new Guid("c1000000-0000-0000-0000-000000000001"), null, null, null, "Alger", new DateTime(2025, 10, 15, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), "amina@example.com", "Amina Benali", false, new DateTime(2026, 4, 11, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), "+213 0550 111 001", 5m, 0, 15, 2, 12, 145000m, 16 },
                    { new Guid("c1000000-0000-0000-0000-000000000002"), null, null, null, "Oran", new DateTime(2025, 12, 14, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), "karim@example.com", "Karim Hadj", false, new DateTime(2026, 4, 3, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), "+213 0661 222 002", 18m, 1, 54, 1, 6, 42000m, 31 },
                    { new Guid("c1000000-0000-0000-0000-000000000003"), null, null, null, "Constantine", new DateTime(2026, 4, 3, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), null, "Fatima Zerhouni", false, new DateTime(2026, 4, 5, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), "+213 0770 333 003", 0m, 0, 0, 0, 1, 3500m, 25 },
                    { new Guid("c1000000-0000-0000-0000-000000000004"), "Taux de retour élevé", new DateTime(2026, 3, 29, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), "SuperAdmin", "Sétif", new DateTime(2025, 9, 25, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), "youcef@example.com", "Youcef Mebarki", true, new DateTime(2026, 2, 27, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), "+213 0555 444 004", 30m, 2, 90, 3, 3, 18000m, 19 },
                    { new Guid("c1000000-0000-0000-0000-000000000005"), null, null, null, "Blida", new DateTime(2025, 6, 17, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), null, "Nadia Boudiaf", false, new DateTime(2026, 1, 3, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), "+213 0660 555 005", 8m, 0, 24, 4, 4, 22000m, 9 }
                });

            migrationBuilder.InsertData(
                table: "orders",
                columns: new[] { "Id", "Amount", "ClientName", "ClientOrderCount", "ClientPhone", "ConfirmedAt", "CreatedAt", "DeliveredAt", "IsNewClient", "OrderNumber", "Risk", "ShippedAt", "Status", "Wilaya" },
                values: new object[,]
                {
                    { new Guid("a1b2c3d4-0001-0001-0001-000000000001"), 4500m, "Nouveau cliente", 0, "+213 0550 123 456", null, new DateTime(2026, 4, 13, 15, 25, 59, 794, DateTimeKind.Utc).AddTicks(5486), null, true, "#10042", 0, null, 1, 16 },
                    { new Guid("a1b2c3d4-0001-0001-0001-000000000002"), 12200m, "Client régulier", 2, "+213 0661 987 654", null, new DateTime(2026, 4, 13, 16, 49, 59, 794, DateTimeKind.Utc).AddTicks(5486), null, false, "#10043", 1, null, 1, 31 },
                    { new Guid("a1b2c3d4-0001-0001-0001-000000000003"), 8400m, "Connu, 1 absence", 1, "+213 0770 456 789", null, new DateTime(2026, 4, 13, 17, 0, 59, 794, DateTimeKind.Utc).AddTicks(5486), null, false, "#10044", 2, null, 1, 19 },
                    { new Guid("a1b2c3d4-0001-0001-0001-000000000004"), 25000m, "VIP client", 15, "+213 0555 111 222", new DateTime(2026, 4, 13, 15, 12, 59, 794, DateTimeKind.Utc).AddTicks(5486), new DateTime(2026, 4, 13, 14, 12, 59, 794, DateTimeKind.Utc).AddTicks(5486), null, false, "#10040", 0, null, 2, 16 },
                    { new Guid("a1b2c3d4-0001-0001-0001-000000000005"), 6800m, "Client Oran", 5, "+213 0660 333 444", new DateTime(2026, 4, 13, 10, 12, 59, 794, DateTimeKind.Utc).AddTicks(5486), new DateTime(2026, 4, 13, 9, 12, 59, 794, DateTimeKind.Utc).AddTicks(5486), new DateTime(2026, 4, 13, 16, 12, 59, 794, DateTimeKind.Utc).AddTicks(5486), false, "#10038", 0, new DateTime(2026, 4, 13, 12, 12, 59, 794, DateTimeKind.Utc).AddTicks(5486), 4, 31 }
                });

            migrationBuilder.InsertData(
                table: "support_tickets",
                columns: new[] { "Id", "AssignedAgentName", "CreatedAt", "CustomerId", "LastActionAt", "Priority", "RelatedOrderId", "ResolvedAt", "Status", "Subject", "TicketNumber", "Type" },
                values: new object[,]
                {
                    { new Guid("d1000000-0000-0000-0000-000000000001"), "CRM Agent", new DateTime(2026, 4, 10, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), new Guid("c1000000-0000-0000-0000-000000000002"), new DateTime(2026, 4, 11, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), 1, "#10043", null, 0, "Produit endommagé à la livraison", "#TKT-0881", 0 },
                    { new Guid("d1000000-0000-0000-0000-000000000002"), "Non assigné", new DateTime(2026, 4, 6, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), new Guid("c1000000-0000-0000-0000-000000000004"), new DateTime(2026, 4, 7, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), 2, "#10039", null, 2, "Demande de remboursement commande #10039", "#TKT-0882", 1 },
                    { new Guid("d1000000-0000-0000-0000-000000000003"), "SuperAdmin", new DateTime(2026, 3, 29, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), new Guid("c1000000-0000-0000-0000-000000000001"), new DateTime(2026, 4, 1, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), 3, "#10010", new DateTime(2026, 4, 1, 17, 12, 59, 796, DateTimeKind.Utc).AddTicks(4029), 4, "Question sur la garantie", "#TKT-0883", 5 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_customers_Email",
                table: "customers",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_customers_Phone",
                table: "customers",
                column: "Phone");

            migrationBuilder.CreateIndex(
                name: "IX_customers_Segment",
                table: "customers",
                column: "Segment");

            migrationBuilder.CreateIndex(
                name: "IX_orders_CreatedAt",
                table: "orders",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_orders_OrderNumber",
                table: "orders",
                column: "OrderNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_orders_Status",
                table: "orders",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_role_claims_RoleId",
                table: "role_claims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "roles",
                column: "NormalizedName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_support_tickets_CustomerId",
                table: "support_tickets",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_user_claims_UserId",
                table: "user_claims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_user_logins_UserId",
                table: "user_logins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_user_roles_RoleId",
                table: "user_roles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "users",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "users",
                column: "NormalizedUserName",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "orders");

            migrationBuilder.DropTable(
                name: "role_claims");

            migrationBuilder.DropTable(
                name: "stock_alerts");

            migrationBuilder.DropTable(
                name: "support_tickets");

            migrationBuilder.DropTable(
                name: "user_claims");

            migrationBuilder.DropTable(
                name: "user_logins");

            migrationBuilder.DropTable(
                name: "user_roles");

            migrationBuilder.DropTable(
                name: "user_tokens");

            migrationBuilder.DropTable(
                name: "customers");

            migrationBuilder.DropTable(
                name: "roles");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
