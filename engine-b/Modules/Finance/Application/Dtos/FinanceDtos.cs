using engine_b.Modules.Finance.Domain;

namespace engine_b.Modules.Finance.Application.Dtos;

// ── Query params ────────────────────────────────────────────────────────────

public class InvoiceQueryParams
{
    public string? Search { get; set; }
    public InvoiceStatus? Status { get; set; }
    public int? Wilaya { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public string? SortBy { get; set; } = "created_desc";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class JournalEntryQueryParams
{
    public Guid? PeriodId { get; set; }
    public JournalEntryType? EntryType { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

// ── Request DTOs ────────────────────────────────────────────────────────────

public class CreateInvoiceRequest
{
    public Guid? OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public int Wilaya { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TaxRate { get; set; } = 19m;
    public string? Notes { get; set; }
}

public class VoidInvoiceRequest
{
    public string Reason { get; set; } = string.Empty;
}

public class CreatePeriodRequest
{
    public string Name { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class CreateFifoLayerRequest
{
    public string Sku { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Warehouse { get; set; } = "Alger WH-01";
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public Guid? PurchaseOrderId { get; set; }
}

// ── Response DTOs ───────────────────────────────────────────────────────────

public class InvoiceDto
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public Guid? OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public int Wilaya { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public InvoiceStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? IssuedAt { get; set; }
    public string? IssuedBy { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? PaidBy { get; set; }
    public DateTime? VoidedAt { get; set; }
    public string? VoidReason { get; set; }
    public string? Notes { get; set; }

    public static InvoiceDto FromEntity(Invoice e) => new()
    {
        Id = e.Id,
        InvoiceNumber = e.InvoiceNumber,
        OrderId = e.OrderId,
        OrderNumber = e.OrderNumber,
        CustomerName = e.CustomerName,
        CustomerPhone = e.CustomerPhone,
        Wilaya = e.Wilaya,
        Subtotal = e.Subtotal,
        TaxRate = e.TaxRate,
        TaxAmount = e.TaxAmount,
        TotalAmount = e.TotalAmount,
        Status = e.Status,
        CreatedAt = e.CreatedAt,
        IssuedAt = e.IssuedAt,
        IssuedBy = e.IssuedBy,
        PaidAt = e.PaidAt,
        PaidBy = e.PaidBy,
        VoidedAt = e.VoidedAt,
        VoidReason = e.VoidReason,
        Notes = e.Notes,
    };
}

public class InvoiceStatsDto
{
    public int TotalCount { get; set; }
    public int DraftCount { get; set; }
    public int IssuedCount { get; set; }
    public int PaidCount { get; set; }
    public int VoidedCount { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal PaidRevenue { get; set; }
    public decimal OutstandingRevenue { get; set; }
}

public class JournalEntryDto
{
    public Guid Id { get; set; }
    public string EntryNumber { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DebitAccount { get; set; } = string.Empty;
    public string CreditAccount { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public JournalEntryType EntryType { get; set; }
    public Guid PeriodId { get; set; }
    public Guid? InvoiceId { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public static JournalEntryDto FromEntity(JournalEntry e) => new()
    {
        Id = e.Id,
        EntryNumber = e.EntryNumber,
        Description = e.Description,
        DebitAccount = e.DebitAccount,
        CreditAccount = e.CreditAccount,
        Amount = e.Amount,
        EntryType = e.EntryType,
        PeriodId = e.PeriodId,
        InvoiceId = e.InvoiceId,
        CreatedBy = e.CreatedBy,
        CreatedAt = e.CreatedAt,
    };
}

public class PeriodDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public PeriodStatus Status { get; set; }
    public DateTime? LockedAt { get; set; }
    public string? LockedBy { get; set; }
    public DateTime? ClosedAt { get; set; }
    public string? ClosedBy { get; set; }
    public int JournalEntryCount { get; set; }

    public static PeriodDto FromEntity(AccountingPeriod e) => new()
    {
        Id = e.Id,
        Name = e.Name,
        StartDate = e.StartDate,
        EndDate = e.EndDate,
        Status = e.Status,
        LockedAt = e.LockedAt,
        LockedBy = e.LockedBy,
        ClosedAt = e.ClosedAt,
        ClosedBy = e.ClosedBy,
        JournalEntryCount = e.JournalEntries.Count,
    };
}

// ── Revenue analytics DTOs ──────────────────────────────────────────────────

public class RevenueOverviewDto
{
    /// <summary>Total revenue (CA) from paid invoices in the period.</summary>
    public decimal TotalRevenue { get; set; }
    /// <summary>Revenue in the comparison period (previous N days).</summary>
    public decimal PreviousPeriodRevenue { get; set; }
    /// <summary>Change percentage vs previous period.</summary>
    public decimal ChangePercent { get; set; }
    public int InvoiceCount { get; set; }
    public int PaidInvoiceCount { get; set; }
    /// <summary>Average invoice value.</summary>
    public decimal AverageInvoiceValue { get; set; }
}

public class RevenueByWilayaDto
{
    public int Wilaya { get; set; }
    public string WilayaName { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int InvoiceCount { get; set; }
    /// <summary>Percentage share of total revenue.</summary>
    public decimal SharePercent { get; set; }
}

public class RevenueTimelinePointDto
{
    public DateTime Date { get; set; }
    public decimal Revenue { get; set; }
    public int InvoiceCount { get; set; }
}

public class TopProductRevenueDto
{
    public string ProductName { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public decimal SharePercent { get; set; }
    /// <summary>Source tags: OMS, CRM, PIM, Catalogue.</summary>
    public List<string> Sources { get; set; } = [];
}

// ── Deferred revenue & FIFO DTOs ────────────────────────────────────────────

public class DeferredRevenueSummaryDto
{
    /// <summary>Total value of confirmed but undelivered orders.</summary>
    public decimal TotalDeferred { get; set; }
    public int ConfirmedCount { get; set; }
    public int ShippedCount { get; set; }
    public decimal ConfirmedValue { get; set; }
    public decimal ShippedValue { get; set; }
}

public class FifoValuationDto
{
    /// <summary>Total FIFO value across all warehouses.</summary>
    public decimal TotalValuation { get; set; }
    public int WarehouseCount { get; set; }
    public int TotalSkus { get; set; }
    public int TotalUnits { get; set; }
    public List<FifoWarehouseSummaryDto> Warehouses { get; set; } = [];
}

public class FifoWarehouseSummaryDto
{
    public string Warehouse { get; set; } = string.Empty;
    public decimal Valuation { get; set; }
    public int SkuCount { get; set; }
    public int UnitCount { get; set; }
    /// <summary>Percentage share of total valuation.</summary>
    public decimal SharePercent { get; set; }
}

public class FifoLayerDto
{
    public Guid Id { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Warehouse { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitCost { get; set; }
    public decimal TotalValue { get; set; }
    public Guid? PurchaseOrderId { get; set; }
    public DateTime ReceivedAt { get; set; }

    public static FifoLayerDto FromEntity(FifoLayer e) => new()
    {
        Id = e.Id,
        Sku = e.Sku,
        ProductName = e.ProductName,
        Warehouse = e.Warehouse,
        Quantity = e.Quantity,
        UnitCost = e.UnitCost,
        TotalValue = e.TotalValue,
        PurchaseOrderId = e.PurchaseOrderId,
        ReceivedAt = e.ReceivedAt,
    };
}

// ── Finance overview (dashboard KPI card) ────────────────────────────────────

public class FinanceOverviewDto
{
    public decimal TotalRevenue { get; set; }
    public decimal RevenueChangePercent { get; set; }
    public decimal FifoValuation { get; set; }
    public int FifoWarehouseCount { get; set; }
    public InvoiceStatsDto InvoiceStats { get; set; } = new();
    public DeferredRevenueSummaryDto DeferredRevenue { get; set; } = new();
}

// ── Re-export PagedResult for Finance (already defined in Procurement) ──────
// Using: engine_b.Modules.Procurement.Application.Dtos.PagedResult<T>
