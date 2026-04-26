using engine_b.Common.Inbound;
using engine_b.Common.Outbox;
using engine_b.Modules.CRM.Domain;
using engine_b.Modules.Dashboard.Domain;
using engine_b.Modules.Identity.Domain;
using engine_b.Modules.Procurement.Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Common.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<AppUser, AppRole, Guid>(options)
{
    // ── CRM ──
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<SupportTicket> SupportTickets => Set<SupportTicket>();
    public DbSet<CustomerInteraction> CustomerInteractions => Set<CustomerInteraction>();

    // ── Dashboard ──
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<StockAlert> StockAlerts => Set<StockAlert>();
    
    // ─── Procurement Module ───
    public DbSet<engine_b.Modules.Procurement.Domain.Supplier> Suppliers { get; set; } = null!;
    public DbSet<engine_b.Modules.Procurement.Domain.PurchaseOrder> PurchaseOrders { get; set; } = null!;
    public DbSet<engine_b.Modules.Procurement.Domain.PurchaseOrderLine> PurchaseOrderLines { get; set; } = null!;
    public DbSet<engine_b.Modules.Procurement.Domain.ProcurementStockAlert> ProcurementStockAlerts { get; set; } = null!;
    public DbSet<engine_b.Modules.Procurement.Domain.ProcurementReceipt> ProcurementReceipts { get; set; } = null!;
    public DbSet<engine_b.Modules.Procurement.Domain.PurchaseOrderAuditEvent> PurchaseOrderAuditEvents { get; set; } = null!;

    // ─── Finance Module ───
    public DbSet<engine_b.Modules.Finance.Domain.Invoice> Invoices { get; set; } = null!;
    public DbSet<engine_b.Modules.Finance.Domain.JournalEntry> JournalEntries { get; set; } = null!;
    public DbSet<engine_b.Modules.Finance.Domain.AccountingPeriod> AccountingPeriods { get; set; } = null!;
    public DbSet<engine_b.Modules.Finance.Domain.FifoLayer> FifoLayers { get; set; } = null!;

    // ─── Returns Module ───
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    // ─── Inbound (cross-engine event ingest) ───
    public DbSet<ProcessedEvent> ProcessedEvents => Set<ProcessedEvent>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // ── Outbox ──
        builder.Entity<OutboxMessage>(e =>
        {
            e.ToTable("outbox_messages");
            e.HasKey(m => m.Id);
            e.HasIndex(m => m.ProcessedAt);
            e.HasIndex(m => m.OccurredAt);
            e.HasIndex(m => new { m.ProcessedAt, m.RetryCount });
        });

        // ── Inbound idempotency ──
        builder.Entity<ProcessedEvent>(e =>
        {
            e.ToTable("processed_events");
            e.HasKey(p => p.EventId);
            e.HasIndex(p => p.ProcessedAt);
            e.Property(p => p.EventType).HasMaxLength(100);
            e.Property(p => p.Source).HasMaxLength(100);
        });

        // ── Identity tables (snake_case for PostgreSQL) ──
        builder.Entity<AppUser>().ToTable("users");
        builder.Entity<AppRole>().ToTable("roles");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserRole<Guid>>().ToTable("user_roles");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserClaim<Guid>>().ToTable("user_claims");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserLogin<Guid>>().ToTable("user_logins");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityRoleClaim<Guid>>().ToTable("role_claims");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserToken<Guid>>().ToTable("user_tokens");

        // ── CRM ──
        builder.Entity<Customer>(e =>
        {
            e.ToTable("customers");
            e.HasKey(c => c.Id);
            e.Property(c => c.TotalRevenue).HasColumnType("decimal(18,2)");
            e.Property(c => c.ReturnRate).HasColumnType("decimal(5,2)");
            e.HasIndex(c => c.Phone);
            e.HasIndex(c => c.Segment);
            e.HasIndex(c => c.Email);
        });

        builder.Entity<SupportTicket>(e =>
        {
            e.ToTable("support_tickets");
            e.HasKey(t => t.Id);
            e.HasOne(t => t.Customer)
             .WithMany(c => c.Tickets)
             .HasForeignKey(t => t.CustomerId);
            e.HasIndex(t => t.Status);
            e.HasIndex(t => t.TicketNumber).IsUnique();
        });

        builder.Entity<CustomerInteraction>(e =>
        {
            e.ToTable("customer_interactions");
            e.HasKey(i => i.Id);
            e.HasOne(i => i.Customer)
             .WithMany(c => c.Interactions)
             .HasForeignKey(i => i.CustomerId);
            e.HasIndex(i => i.CustomerId);
            e.HasIndex(i => i.CreatedAt);
        });

        // ── Dashboard / Orders ──
        builder.Entity<Order>(e =>
        {
            e.ToTable("orders");
            e.HasKey(o => o.Id);
            e.Property(o => o.Amount).HasColumnType("decimal(18,2)");
            e.HasIndex(o => o.Status);
            e.HasIndex(o => o.CreatedAt);
            e.HasIndex(o => o.OrderNumber).IsUnique();
        });

        builder.Entity<StockAlert>(e =>
        {
            e.ToTable("stock_alerts");
            e.HasKey(s => s.Id);
        });

        // ── Procurement ──
        builder.Entity<Supplier>(e =>
        {
            e.ToTable("proc_suppliers");
            e.HasKey(x => x.Id);
            e.Property(x => x.ReliabilityScore).HasColumnType("decimal(5,2)");
            e.Property(x => x.OnTimeRate).HasColumnType("decimal(5,2)");
            e.Property(x => x.AverageCostIndex).HasColumnType("decimal(5,2)");
            e.HasIndex(x => x.Name);
        });

        builder.Entity<PurchaseOrder>(e =>
        {
            e.ToTable("proc_purchase_orders");
            e.HasKey(x => x.Id);
            e.Property(x => x.Subtotal).HasColumnType("decimal(18,2)");
            e.Property(x => x.TransportCost).HasColumnType("decimal(18,2)");
            e.Property(x => x.CustomsCost).HasColumnType("decimal(18,2)");
            e.Property(x => x.TotalAmount).HasColumnType("decimal(18,2)");
            e.Property(x => x.BudgetAvailable).HasColumnType("decimal(18,2)");
            e.HasOne(x => x.Supplier).WithMany().HasForeignKey(x => x.SupplierId);
            e.HasIndex(x => x.Reference).IsUnique();
            e.HasIndex(x => x.Status);
        });

        builder.Entity<PurchaseOrderLine>(e =>
        {
            e.ToTable("proc_purchase_order_lines");
            e.HasKey(x => x.Id);
            e.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
            e.Property(x => x.Subtotal).HasColumnType("decimal(18,2)");
            e.HasOne(x => x.PurchaseOrder).WithMany(x => x.Lines).HasForeignKey(x => x.PurchaseOrderId);
        });

        builder.Entity<ProcurementStockAlert>(e =>
        {
            e.ToTable("proc_stock_alerts");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.IsResolved);
            e.HasIndex(x => x.Severity);
        });

        builder.Entity<ProcurementReceipt>(e =>
        {
            e.ToTable("proc_receipts");
            e.HasKey(x => x.Id);
            e.Property(x => x.TotalReceivedValue).HasColumnType("decimal(18,2)");
            e.HasOne(x => x.PurchaseOrder).WithMany().HasForeignKey(x => x.PurchaseOrderId);
        });

        builder.Entity<PurchaseOrderAuditEvent>(e =>
        {
            e.ToTable("proc_purchase_order_audit_events");
            e.HasKey(x => x.Id);
            e.HasOne(x => x.PurchaseOrder)
             .WithMany(x => x.AuditEvents)
             .HasForeignKey(x => x.PurchaseOrderId);
            e.HasIndex(x => x.PurchaseOrderId);
            e.HasIndex(x => x.CreatedAt);
        });

        // ─── Finance Module ───
        builder.Entity<engine_b.Modules.Finance.Domain.Invoice>(b =>
        {
            b.ToTable("invoices");
            b.HasIndex(x => x.InvoiceNumber).IsUnique();
            b.HasIndex(x => x.OrderNumber);
            b.Property(x => x.Subtotal).HasColumnType("numeric(18,2)");
            b.Property(x => x.TaxRate).HasColumnType("numeric(18,2)");
            b.Property(x => x.TaxAmount).HasColumnType("numeric(18,2)");
            b.Property(x => x.TotalAmount).HasColumnType("numeric(18,2)");
        });

        builder.Entity<engine_b.Modules.Finance.Domain.JournalEntry>(b =>
        {
            b.ToTable("journal_entries");
            b.HasIndex(x => x.EntryNumber).IsUnique();
            b.Property(x => x.Amount).HasColumnType("numeric(18,2)");
            b.HasOne(x => x.Period).WithMany(p => p.JournalEntries).HasForeignKey(x => x.PeriodId);
        });

        builder.Entity<engine_b.Modules.Finance.Domain.AccountingPeriod>(b =>
        {
            b.ToTable("accounting_periods");
            b.HasIndex(x => x.Name).IsUnique();
        });

        builder.Entity<engine_b.Modules.Finance.Domain.FifoLayer>(b =>
        {
            b.ToTable("fifo_layers");
            b.HasIndex(x => x.Sku);
            b.HasIndex(x => x.Warehouse);
            b.Property(x => x.UnitCost).HasColumnType("numeric(18,2)");
        });

        // ── Seed: sample data ──
        SeedOrders(builder);
        SeedCustomersAndTickets(builder);
        SeedInteractions(builder);
        SeedProcurement(builder);
    }

    private static void SeedOrders(ModelBuilder builder)
    {
        var now = DateTime.UtcNow;

        builder.Entity<Order>().HasData(
            new Order
            {
                Id = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000001"),
                OrderNumber = "#10042", ClientPhone = "+213 0550 123 456",
                ClientName = "Nouveau cliente", Wilaya = 16, Amount = 4500,
                Status = OrderStatus.EnAttente, Risk = OrderRisk.Faible,
                IsNewClient = true, ClientOrderCount = 0, CreatedAt = now.AddMinutes(-107),
            },
            new Order
            {
                Id = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000002"),
                OrderNumber = "#10043", ClientPhone = "+213 0661 987 654",
                ClientName = "Client régulier", Wilaya = 31, Amount = 12200,
                Status = OrderStatus.EnAttente, Risk = OrderRisk.Moyen,
                IsNewClient = false, ClientOrderCount = 2, CreatedAt = now.AddMinutes(-23),
            },
            new Order
            {
                Id = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000003"),
                OrderNumber = "#10044", ClientPhone = "+213 0770 456 789",
                ClientName = "Connu, 1 absence", Wilaya = 19, Amount = 8400,
                Status = OrderStatus.EnAttente, Risk = OrderRisk.Eleve,
                IsNewClient = false, ClientOrderCount = 1, CreatedAt = now.AddMinutes(-12),
            },
            new Order
            {
                Id = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000004"),
                OrderNumber = "#10040", ClientPhone = "+213 0555 111 222",
                ClientName = "VIP client", Wilaya = 16, Amount = 25000,
                Status = OrderStatus.Confirmee, Risk = OrderRisk.Faible,
                IsNewClient = false, ClientOrderCount = 15,
                CreatedAt = now.AddHours(-3), ConfirmedAt = now.AddHours(-2),
            },
            new Order
            {
                Id = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000005"),
                OrderNumber = "#10038", ClientPhone = "+213 0660 333 444",
                ClientName = "Client Oran", Wilaya = 31, Amount = 6800,
                Status = OrderStatus.Livree, Risk = OrderRisk.Faible,
                IsNewClient = false, ClientOrderCount = 5,
                CreatedAt = now.AddHours(-8), ConfirmedAt = now.AddHours(-7),
                ShippedAt = now.AddHours(-5), DeliveredAt = now.AddHours(-1),
            }
        );
    }

    private static void SeedCustomersAndTickets(ModelBuilder builder)
    {
        var now = DateTime.UtcNow;

        var custId1 = Guid.Parse("c1000000-0000-0000-0000-000000000001");
        var custId2 = Guid.Parse("c1000000-0000-0000-0000-000000000002");
        var custId3 = Guid.Parse("c1000000-0000-0000-0000-000000000003");
        var custId4 = Guid.Parse("c1000000-0000-0000-0000-000000000004");
        var custId5 = Guid.Parse("c1000000-0000-0000-0000-000000000005");

        builder.Entity<Customer>().HasData(
            new Customer
            {
                Id = custId1, FullName = "Amina Benali", Phone = "+213 0550 111 001",
                Email = "amina@example.com", Wilaya = 16, City = "Alger",
                TotalOrders = 12, TotalRevenue = 145_000, ReturnRate = 5,
                Segment = CustomerSegment.VIP, RiskLevel = RiskLevel.Faible, RiskScore = 15,
                CreatedAt = now.AddDays(-180), LastOrderDate = now.AddDays(-2),
            },
            new Customer
            {
                Id = custId2, FullName = "Karim Hadj", Phone = "+213 0661 222 002",
                Email = "karim@example.com", Wilaya = 31, City = "Oran",
                TotalOrders = 6, TotalRevenue = 42_000, ReturnRate = 18,
                Segment = CustomerSegment.Fidele, RiskLevel = RiskLevel.Moyen, RiskScore = 54,
                CreatedAt = now.AddDays(-120), LastOrderDate = now.AddDays(-10),
            },
            new Customer
            {
                Id = custId3, FullName = "Fatima Zerhouni", Phone = "+213 0770 333 003",
                Wilaya = 25, City = "Constantine",
                TotalOrders = 1, TotalRevenue = 3_500, ReturnRate = 0,
                Segment = CustomerSegment.Nouveau, RiskLevel = RiskLevel.Faible, RiskScore = 0,
                CreatedAt = now.AddDays(-10), LastOrderDate = now.AddDays(-8),
            },
            new Customer
            {
                Id = custId4, FullName = "Youcef Mebarki", Phone = "+213 0555 444 004",
                Email = "youcef@example.com", Wilaya = 19, City = "Sétif",
                TotalOrders = 3, TotalRevenue = 18_000, ReturnRate = 30,
                Segment = CustomerSegment.ARisque, RiskLevel = RiskLevel.Eleve, RiskScore = 90,
                IsBlacklisted = true, BlacklistReason = "Taux de retour élevé", BlacklistedAt = now.AddDays(-15), BlacklistedBy = "SuperAdmin",
                CreatedAt = now.AddDays(-200), LastOrderDate = now.AddDays(-45),
            },
            new Customer
            {
                Id = custId5, FullName = "Nadia Boudiaf", Phone = "+213 0660 555 005",
                Wilaya = 9, City = "Blida",
                TotalOrders = 4, TotalRevenue = 22_000, ReturnRate = 8,
                Segment = CustomerSegment.Inactif, RiskLevel = RiskLevel.Faible, RiskScore = 24,
                CreatedAt = now.AddDays(-300), LastOrderDate = now.AddDays(-100),
            }
        );

        builder.Entity<SupportTicket>().HasData(
            new SupportTicket
            {
                Id = Guid.Parse("d1000000-0000-0000-0000-000000000001"),
                CustomerId = custId2, Subject = "Produit endommagé à la livraison",
                TicketNumber = "#TKT-0881", Type = TicketType.DeliveryDispute, Priority = TicketPriority.High, RelatedOrderId = "#10043", AssignedAgentName = "CRM Agent", LastActionAt = now.AddDays(-2),
                Status = TicketStatus.Open, CreatedAt = now.AddDays(-3),
            },
            new SupportTicket
            {
                Id = Guid.Parse("d1000000-0000-0000-0000-000000000002"),
                CustomerId = custId4, Subject = "Demande de remboursement commande #10039",
                TicketNumber = "#TKT-0882", Type = TicketType.ProductReturn, Priority = TicketPriority.Normal, RelatedOrderId = "#10039", AssignedAgentName = "Non assigné", LastActionAt = now.AddDays(-6),
                Status = TicketStatus.Escalated, CreatedAt = now.AddDays(-7),
            },
            new SupportTicket
            {
                Id = Guid.Parse("d1000000-0000-0000-0000-000000000003"),
                CustomerId = custId1, Subject = "Question sur la garantie",
                TicketNumber = "#TKT-0883", Type = TicketType.Other, Priority = TicketPriority.Low, RelatedOrderId = "#10010", AssignedAgentName = "SuperAdmin", LastActionAt = now.AddDays(-12),
                Status = TicketStatus.Closed, CreatedAt = now.AddDays(-15),
                ResolvedAt = now.AddDays(-12),
            }
        );
    }

    private static void SeedInteractions(ModelBuilder builder)
    {
        var now = DateTime.UtcNow;

        var custId1 = Guid.Parse("c1000000-0000-0000-0000-000000000001");
        var custId2 = Guid.Parse("c1000000-0000-0000-0000-000000000002");
        var custId3 = Guid.Parse("c1000000-0000-0000-0000-000000000003");

        builder.Entity<CustomerInteraction>().HasData(
            new CustomerInteraction
            {
                Id = Guid.Parse("e1000000-0000-0000-0000-000000000001"),
                CustomerId = custId1,
                Content = "Client VIP — a appelé pour confirmer sa commande #10040. Livraison OK.",
                Type = InteractionType.Appel,
                CreatedBy = "CRM Agent",
                CreatedAt = now.AddDays(-2),
            },
            new CustomerInteraction
            {
                Id = Guid.Parse("e1000000-0000-0000-0000-000000000002"),
                CustomerId = custId2,
                Content = "Message WhatsApp envoyé au client pour suivi du ticket #TKT-0881.",
                Type = InteractionType.WhatsApp,
                CreatedBy = "CRM Agent",
                CreatedAt = now.AddDays(-3),
            },
            new CustomerInteraction
            {
                Id = Guid.Parse("e1000000-0000-0000-0000-000000000003"),
                CustomerId = custId3,
                Content = "Premier contact client — bien reçu la commande, très satisfaite.",
                Type = InteractionType.Note,
                CreatedBy = "SuperAdmin",
                CreatedAt = now.AddDays(-8),
            }
        );
    }

    private static void SeedProcurement(ModelBuilder builder)
    {
        var now = DateTime.UtcNow;
        var s1 = Guid.Parse("f1000000-0000-0000-0000-000000000001");
        var s2 = Guid.Parse("f1000000-0000-0000-0000-000000000002");
        var s3 = Guid.Parse("f1000000-0000-0000-0000-000000000003");

        builder.Entity<Supplier>().HasData(
            new Supplier { Id = s1, Name = "Apple Distribution", Country = "France", City = "Paris", ContactName = "Jean-Pierre Martin", Email = "jp@apple-dist.fr", Phone = "+33 1 00 00 00 00", LeadTimeDays = 5, ReliabilityScore = 67, OnTimeRate = 76, AverageCostIndex = 100 },
            new Supplier { Id = s2, Name = "Nike MENA", Country = "UAE", City = "Dubai", ContactName = "M. Karim Hassan", Email = "karim@nike-mena.ae", Phone = "+971 50 000 00 00", LeadTimeDays = 7, ReliabilityScore = 94, OnTimeRate = 92, AverageCostIndex = 98 },
            new Supplier { Id = s3, Name = "Samsung Electronics", Country = "Korea", City = "Seoul", ContactName = "A. Mehdi Khan", Email = "mehdi@samsung.co.kr", Phone = "+82 2 0000 0000", LeadTimeDays = 6, ReliabilityScore = 78, OnTimeRate = 83, AverageCostIndex = 101 }
        );

        var po1 = Guid.Parse("f2000000-0000-0000-0000-000000000001");
        var po2 = Guid.Parse("f2000000-0000-0000-0000-000000000002");

        builder.Entity<PurchaseOrder>().HasData(
            new PurchaseOrder
            {
                Id = po1, Reference = "BC-897", SupplierId = s1, Status = PurchaseOrderStatus.PendingApproval, Priority = PurchaseOrderPriority.Urgent,
                CreatedBy = "Procurement Manager", Warehouse = "Alger WH-01", Subtotal = 900000, TransportCost = 0, CustomsCost = 0,
                TotalAmount = 900000, BudgetAvailable = 750000, CreatedAt = now.AddDays(-2), EtaDate = now.AddDays(5)
            },
            new PurchaseOrder
            {
                Id = po2, Reference = "BC-892", SupplierId = s2, Status = PurchaseOrderStatus.Approved, Priority = PurchaseOrderPriority.High,
                CreatedBy = "Procurement Manager", ApprovedBy = "SuperAdmin", Warehouse = "Alger WH-01", Subtotal = 264000, TransportCost = 0, CustomsCost = 0,
                TotalAmount = 264000, BudgetAvailable = 420000, CreatedAt = now.AddDays(-4), EtaDate = now.AddDays(3), ApprovedAt = now.AddDays(-3)
            }
        );

        builder.Entity<PurchaseOrderLine>().HasData(
            new PurchaseOrderLine { Id = Guid.Parse("f3000000-0000-0000-0000-000000000001"), PurchaseOrderId = po1, Sku = "SKU-851", ProductName = "Apple AirPods Pro 2", Quantity = 50, UnitPrice = 18000, Subtotal = 900000, ReceivedQuantity = 0 },
            new PurchaseOrderLine { Id = Guid.Parse("f3000000-0000-0000-0000-000000000002"), PurchaseOrderId = po2, Sku = "SKU-812", ProductName = "Nike Air Max 90", Quantity = 62, UnitPrice = 4258.06m, Subtotal = 264000, ReceivedQuantity = 0 }
        );

        builder.Entity<ProcurementStockAlert>().HasData(
            new ProcurementStockAlert { Id = Guid.Parse("f4000000-0000-0000-0000-000000000001"), ProductName = "Apple AirPods Pro 2ème Génération", Sku = "SKU-851", AvailableUnits = 0, ReorderThreshold = 25, SuggestedOrderQty = 50, SupplierName = "Apple Distribution", Severity = AlertSeverity.Critical, IsResolved = false, DetectedAt = now.AddHours(-4) },
            new ProcurementStockAlert { Id = Guid.Parse("f4000000-0000-0000-0000-000000000002"), ProductName = "Nike Air Max 90", Sku = "SKU-818", AvailableUnits = 5, ReorderThreshold = 10, SuggestedOrderQty = 12, SupplierName = "Nike MENA", Severity = AlertSeverity.Warning, IsResolved = false, DetectedAt = now.AddHours(-8) }
        );

        builder.Entity<ProcurementReceipt>().HasData(
            new ProcurementReceipt { Id = Guid.Parse("f5000000-0000-0000-0000-000000000001"), PurchaseOrderId = po2, ReceiptNumber = "REC-892-1", UnitsReceived = 62, TotalReceivedValue = 264000, ReceivedAt = now.AddDays(-1), ReceivedBy = "Inventory Manager" }
        );

        builder.Entity<PurchaseOrderAuditEvent>().HasData(
            new PurchaseOrderAuditEvent
            {
                Id = Guid.Parse("f6000000-0000-0000-0000-000000000001"),
                PurchaseOrderId = po1,
                EventType = "created",
                Message = "BC-897 created and submitted for approval.",
                Actor = "Procurement Manager",
                CreatedAt = now.AddDays(-2)
            },
            new PurchaseOrderAuditEvent
            {
                Id = Guid.Parse("f6000000-0000-0000-0000-000000000002"),
                PurchaseOrderId = po2,
                EventType = "approved",
                Message = "BC-892 approved by SuperAdmin.",
                Actor = "SuperAdmin",
                CreatedAt = now.AddDays(-3)
            }
        );
    }
}