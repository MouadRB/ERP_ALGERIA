namespace engine_b.Modules.Dashboard.Application.Dtos;

/// <summary>
/// The 4 KPI summary cards at the top of the dashboard:
/// 1. Commandes Aujourd'hui  (orders today + % vs yesterday)
/// 2. En Attente Confirmation (pending count + max wait time)
/// 3. Taux de Livraison       (delivery rate % + week trend)
/// 4. Articles en Rupture     (out-of-stock count + new today)
/// </summary>
public class DashboardKpiDto
{
    // Card 1 — Orders today
    public int OrdersToday { get; set; }
    public decimal OrdersVsYesterdayPct { get; set; }

    // Card 2 — Pending confirmation
    public int PendingConfirmation { get; set; }
    public int MaxWaitMinutes { get; set; }

    // Card 3 — Delivery rate
    public decimal DeliveryRatePct { get; set; }
    public decimal DeliveryRateWeekTrendPct { get; set; }

    // Card 4 — Out of stock
    public int OutOfStockArticles { get; set; }
    public int NewOutOfStockToday { get; set; }
}
