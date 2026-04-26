namespace engine_b.Modules.CRM.Application.Dtos;

/// <summary>Aggregated KPIs for the CRM summary cards.</summary>
public class CustomerStatsDto
{
    public int VipCount { get; set; }
    public decimal VipRevenue { get; set; }
    public int TotalOrdersAllClients { get; set; }
    public int NouveauCount { get; set; }
    public int InactifCount { get; set; }
    public int OpenTicketCount { get; set; }
    public int BlacklistedCount { get; set; }
    public int TotalCustomers { get; set; }
    public int ActiveCustomers { get; set; }
    public int AtRiskCount { get; set; }
}
