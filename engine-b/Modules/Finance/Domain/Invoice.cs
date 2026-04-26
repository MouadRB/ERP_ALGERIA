namespace engine_b.Modules.Finance.Domain;

/// <summary>Invoice status lifecycle: Draft → Issued → Paid | Voided.</summary>
public enum InvoiceStatus
{
    Draft = 0,
    Issued = 1,
    Paid = 2,
    Voided = 3,
}

/// <summary>
/// Financial document generated from a delivered/collected COD order.
/// Represents a receivable (or collected cash) in DZD.
/// </summary>
public class Invoice
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Readable invoice reference, e.g. "FAC-2026-0001".</summary>
    public string InvoiceNumber { get; set; } = string.Empty;

    // ── Source order (denormalized for fast dashboard reads) ──
    public Guid? OrderId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;

    /// <summary>Wilaya code 1–58 — used for regional revenue breakdown.</summary>
    public int Wilaya { get; set; }

    // ── Amounts in DZD ──
    public decimal Subtotal { get; set; }

    /// <summary>TVA rate (default 19%).</summary>
    public decimal TaxRate { get; set; } = 19m;
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }

    // ── Status ──
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;

    // ── Timestamps & actors ──
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? IssuedAt { get; set; }
    public string? IssuedBy { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? PaidBy { get; set; }
    public DateTime? VoidedAt { get; set; }
    public string? VoidedBy { get; set; }
    public string? VoidReason { get; set; }

    public string? Notes { get; set; }
}
