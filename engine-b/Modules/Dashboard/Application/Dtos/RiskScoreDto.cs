namespace engine_b.Modules.Dashboard.Application.Dtos;

/// <summary>
/// "Score de Risque — Commandes du Jour" donut chart data.
/// </summary>
public class RiskScoreDto
{
    public int TotalOrders { get; set; }
    public int FaibleCount { get; set; }
    public decimal FaiblePct { get; set; }
    public int MoyenCount { get; set; }
    public decimal MoyenPct { get; set; }
    public int EleveCount { get; set; }
    public decimal ElevePct { get; set; }
}
