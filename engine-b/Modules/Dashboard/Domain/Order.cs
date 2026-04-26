namespace engine_b.Modules.Dashboard.Domain;

/// <summary>
/// Represents a COD (Cash on Delivery) order – the core entity
/// visible in both the confirmation queue and the dashboard KPIs.
/// </summary>
public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Readable order reference, e.g. "#10042".</summary>
    public string OrderNumber { get; set; } = string.Empty;

    // ── Client info (denormalized for fast dashboard reads) ──
    public string ClientPhone { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;

    /// <summary>Wilaya code 1–48.</summary>
    public int Wilaya { get; set; }

    /// <summary>Amount in DZD.</summary>
    public decimal Amount { get; set; }

    // ── Status & risk ──
    public OrderStatus Status { get; set; } = OrderStatus.Passee;
    public OrderRisk Risk { get; set; } = OrderRisk.Faible;

    // ── Timestamps ──
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }

    /// <summary>Whether this is a new or returning client.</summary>
    public bool IsNewClient { get; set; }

    /// <summary>Number of previous orders by this client.</summary>
    public int ClientOrderCount { get; set; }
}
