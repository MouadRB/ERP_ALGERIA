namespace engine_b.Modules.Procurement.Domain;

public enum PurchaseOrderStatus
{
    Draft = 0,
    PendingApproval = 1,
    Approved = 2,
    SentToSupplier = 3,
    PartiallyReceived = 4,
    Received = 5,
    Cancelled = 6
}

public enum PurchaseOrderPriority
{
    Normal = 0,
    Urgent = 1,
    High = 2,
    Low = 3
}

public enum AlertSeverity
{
    Info = 0,
    Warning = 1,
    Critical = 2
}

public class Supplier
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string ContactName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public int LeadTimeDays { get; set; }
    public decimal ReliabilityScore { get; set; }
    public decimal OnTimeRate { get; set; }
    public decimal AverageCostIndex { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class PurchaseOrder
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Reference { get; set; } = string.Empty;
    public Guid SupplierId { get; set; }
    public Supplier? Supplier { get; set; }
    public PurchaseOrderStatus Status { get; set; } = PurchaseOrderStatus.Draft;
    public PurchaseOrderPriority Priority { get; set; } = PurchaseOrderPriority.Normal;
    public string SodRule { get; set; } = "PM cannot self-approve";
    public string CreatedBy { get; set; } = "Procurement Manager";
    public string? ApprovedBy { get; set; }
    public string Warehouse { get; set; } = "Alger WH-01";
    public string Currency { get; set; } = "DZD";
    public decimal TransportCost { get; set; }
    public decimal CustomsCost { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal BudgetAvailable { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EtaDate { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? ReceivedAt { get; set; }
    public string? Notes { get; set; }
    public ICollection<PurchaseOrderLine> Lines { get; set; } = [];
    public ICollection<PurchaseOrderAuditEvent> AuditEvents { get; set; } = [];
}

public class PurchaseOrderLine
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PurchaseOrderId { get; set; }
    public PurchaseOrder? PurchaseOrder { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }
    public int ReceivedQuantity { get; set; }
}

public class ProcurementStockAlert
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ProductName { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public int AvailableUnits { get; set; }
    public int ReorderThreshold { get; set; }
    public int SuggestedOrderQty { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public AlertSeverity Severity { get; set; } = AlertSeverity.Warning;
    public bool IsResolved { get; set; }
    public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
}

public class ProcurementReceipt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PurchaseOrderId { get; set; }
    public PurchaseOrder? PurchaseOrder { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty;
    public int UnitsReceived { get; set; }
    public decimal TotalReceivedValue { get; set; }
    public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;
    public string ReceivedBy { get; set; } = "Inventory Manager";
}

public class PurchaseOrderAuditEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PurchaseOrderId { get; set; }
    public PurchaseOrder? PurchaseOrder { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Actor { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
