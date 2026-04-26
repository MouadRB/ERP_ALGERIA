using engine_b.Modules.Procurement.Domain;

namespace engine_b.Modules.Procurement.Application.Dtos;

public class PurchaseOrderQueryParams
{
    public string? Search { get; set; }
    public PurchaseOrderStatus? Status { get; set; }
    public PurchaseOrderPriority? Priority { get; set; }
    public Guid? SupplierId { get; set; }
    public string? SortBy { get; set; } = "created_desc";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class CreatePurchaseOrderRequest
{
    public Guid SupplierId { get; set; }
    public PurchaseOrderPriority Priority { get; set; }
    public string Warehouse { get; set; } = "Alger WH-01";
    public decimal BudgetAvailable { get; set; }
    public decimal TransportCost { get; set; }
    public decimal CustomsCost { get; set; }
    public string? Notes { get; set; }
    public List<CreatePurchaseOrderLineRequest> Lines { get; set; } = [];
}

public class CreatePurchaseOrderLineRequest
{
    public string Sku { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class UpdatePurchaseOrderStatusRequest
{
    public PurchaseOrderStatus Status { get; set; }
}

public class ReceivePurchaseOrderRequest
{
    public string ReceiptNumber { get; set; } = string.Empty;
    public string ReceivedBy { get; set; } = "Inventory Manager";
    public List<ReceivePurchaseOrderLineRequest> Lines { get; set; } = [];
}

public class ReceivePurchaseOrderLineRequest
{
    public Guid PurchaseOrderLineId { get; set; }
    public int ReceivedQuantity { get; set; }
}

public class CreateGroupedPurchaseOrderFromAlertsRequest
{
    public Guid SupplierId { get; set; }
    public PurchaseOrderPriority Priority { get; set; } = PurchaseOrderPriority.Urgent;
    public string Warehouse { get; set; } = "Alger WH-01";
    public decimal BudgetAvailable { get; set; }
    public decimal DefaultUnitPrice { get; set; } = 1000;
    public bool OnlyUrgent { get; set; } = true;
}

public class BatchActionResultDto
{
    public int ProcessedCount { get; set; }
    public int SucceededCount { get; set; }
    public List<string> Errors { get; set; } = [];
}

public class PurchaseOrderListItemDto
{
    public Guid Id { get; set; }
    public string Reference { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public int ArticlesCount { get; set; }
    public decimal Amount { get; set; }
    public PurchaseOrderStatus Status { get; set; }
    public PurchaseOrderPriority Priority { get; set; }
    public string Sod { get; set; } = string.Empty;
    public DateTime? EtaDate { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PurchaseOrderDetailDto
{
    public Guid Id { get; set; }
    public string Reference { get; set; } = string.Empty;
    public PurchaseOrderStatus Status { get; set; }
    public PurchaseOrderPriority Priority { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string Warehouse { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal TransportCost { get; set; }
    public decimal CustomsCost { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal BudgetAvailable { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? EtaDate { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string? ApprovedBy { get; set; }
    public List<PurchaseOrderLineDto> Lines { get; set; } = [];
}

public class PurchaseOrderLineDto
{
    public Guid Id { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }
    public int ReceivedQuantity { get; set; }
}

public class ProcurementOverviewDto
{
    public int TotalPurchaseOrders { get; set; }
    public int PendingApprovalCount { get; set; }
    public int ActiveSuppliers { get; set; }
    public int ReceiptsThisMonth { get; set; }
    public int StockAlertsCount { get; set; }
    public decimal MonthlySpend { get; set; }
}

public class PurchaseOrderAuditEventDto
{
    public Guid Id { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Actor { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class ProcurementAnalyticsDto
{
    public int DraftCount { get; set; }
    public int PendingApprovalCount { get; set; }
    public int ApprovedCount { get; set; }
    public int SentCount { get; set; }
    public int ReceivedCount { get; set; }
    public decimal AverageLeadTimeDays { get; set; }
    public List<SupplierPerformanceDto> SupplierPerformance { get; set; } = [];
}

public class SupplierPerformanceDto
{
    public Guid SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public decimal TotalSpend { get; set; }
    public int OrdersCount { get; set; }
    public decimal OnTimeRate { get; set; }
    public decimal ReliabilityScore { get; set; }
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = [];
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
}
