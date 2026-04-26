namespace engine_b.Modules.Dashboard.Application.Dtos;

/// <summary>Aggregates all dashboard data into a single response.</summary>
public class DashboardSummaryDto
{
    public DashboardKpiDto Kpis { get; set; } = new();
    public List<ConfirmationQueueItemDto> ConfirmationQueue { get; set; } = [];
    public CodFunnelDto CodFunnel { get; set; } = new();
    public RiskScoreDto RiskScore { get; set; } = new();
}
