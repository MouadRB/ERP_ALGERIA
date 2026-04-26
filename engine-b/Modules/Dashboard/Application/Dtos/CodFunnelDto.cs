namespace engine_b.Modules.Dashboard.Application.Dtos;

/// <summary>
/// COD (Cash on Delivery) funnel — "Entonnoir COD — Aujourd'hui".
/// Each step shows a count and a percentage of total orders.
/// </summary>
public class CodFunnelDto
{
    public int TotalOrders { get; set; }
    public FunnelStep Passees { get; set; } = new();
    public FunnelStep Confirmees { get; set; } = new();
    public FunnelStep Expediees { get; set; } = new();
    public FunnelStep Livrees { get; set; } = new();
    public FunnelStep Remises { get; set; } = new();
    public FunnelStep Retournees { get; set; } = new();
}

public class FunnelStep
{
    public int Count { get; set; }
    public decimal Percentage { get; set; }
}
