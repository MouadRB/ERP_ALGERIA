namespace engine_b.Modules.CRM.Application.Dtos;

/// <summary>
/// Full customer profile DTO — used by the customer detail view.
/// Combines the standard CustomerDto fields with aggregated ticket/interaction counts.
/// </summary>
public class CustomerDetailDto : CustomerDto
{
    /// <summary>Total number of support tickets for this customer.</summary>
    public int TicketCount { get; set; }

    /// <summary>Number of currently open/non-closed tickets.</summary>
    public int OpenTicketCount { get; set; }

    /// <summary>Number of logged interactions / notes.</summary>
    public int InteractionCount { get; set; }

    /// <summary>Derived: average order value (TotalRevenue / TotalOrders).</summary>
    public decimal AverageOrderValue => TotalOrders > 0 ? Math.Round(TotalRevenue / TotalOrders, 2) : 0;
}
