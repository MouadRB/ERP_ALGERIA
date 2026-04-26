namespace engine_b.Modules.Finance.Domain;

/// <summary>
/// A FIFO (First-In-First-Out) cost layer for inventory valuation.
/// Each procurement receipt creates a new layer; consumption depletes
/// the oldest layers first. Powers the "Valorisation FIFO" dashboard KPI.
/// </summary>
public class FifoLayer
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Sku { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;

    /// <summary>Warehouse location, e.g. "Alger WH-01".</summary>
    public string Warehouse { get; set; } = string.Empty;

    /// <summary>Remaining units in this layer.</summary>
    public int Quantity { get; set; }

    /// <summary>Purchase cost per unit in DZD.</summary>
    public decimal UnitCost { get; set; }

    /// <summary>Total value = Quantity × UnitCost.</summary>
    public decimal TotalValue => Quantity * UnitCost;

    /// <summary>Source purchase order (if created from procurement).</summary>
    public Guid? PurchaseOrderId { get; set; }

    public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;
}
