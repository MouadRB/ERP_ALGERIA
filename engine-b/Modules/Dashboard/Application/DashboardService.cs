using engine_b.Common;
using engine_b.Modules.Dashboard.Application.Dtos;

namespace engine_b.Modules.Dashboard.Application;

/// <summary>
/// Dashboard read-paths now fetch from engine-a's <c>/oms/v1/dashboard</c>
/// directly — engine-a is the source of truth for orders, KPIs, and funnel
/// state. Confirm-actions are proxied to engine-a's lifecycle endpoints so
/// engine-b never mutates a local order replica.
/// </summary>
public class DashboardService(IEngineAClient engineA)
{
    public async Task<DashboardSummaryDto> GetSummaryAsync()
    {
        var src = await engineA.GetDashboardAsync();
        return new DashboardSummaryDto
        {
            Kpis              = MapKpis(src.Kpis),
            ConfirmationQueue = src.ConfirmationQueue.Select(MapQueueItem).ToList(),
            CodFunnel         = MapFunnel(src.CodFunnel),
            RiskScore         = MapRisk(src.RiskScore),
        };
    }

    public async Task<DashboardKpiDto> GetKpisAsync()
        => MapKpis((await engineA.GetDashboardAsync()).Kpis);

    public async Task<List<ConfirmationQueueItemDto>> GetConfirmationQueueAsync()
        => (await engineA.GetDashboardAsync()).ConfirmationQueue.Select(MapQueueItem).ToList();

    public async Task<CodFunnelDto> GetCodFunnelAsync()
        => MapFunnel((await engineA.GetDashboardAsync()).CodFunnel);

    public async Task<RiskScoreDto> GetRiskScoreAsync()
        => MapRisk((await engineA.GetDashboardAsync()).RiskScore);

    public Task<bool> ConfirmOrderAsync(Guid orderId)
        => engineA.ConfirmOrderAsync(orderId);

    public async Task<int> ConfirmAllPendingAsync()
    {
        var queue = (await engineA.GetDashboardAsync()).ConfirmationQueue;
        var confirmed = 0;
        foreach (var item in queue)
        {
            if (await engineA.ConfirmOrderAsync(item.OrderId))
                confirmed++;
        }
        return confirmed;
    }

    // ── Mappers (engine-a wire DTO → dashboard public DTO) ───────────────────

    private static DashboardKpiDto MapKpis(EngineAKpisDto k) => new()
    {
        OrdersToday              = k.OrdersToday,
        OrdersVsYesterdayPct     = k.OrdersVsYesterdayPct,
        PendingConfirmation      = k.PendingConfirmation,
        MaxWaitMinutes           = k.MaxWaitMinutes,
        DeliveryRatePct          = k.DeliveryRatePct,
        DeliveryRateWeekTrendPct = k.DeliveryRateWeekTrendPct,
        OutOfStockArticles       = k.OutOfStockArticles,
        NewOutOfStockToday       = k.NewOutOfStockToday,
    };

    private static ConfirmationQueueItemDto MapQueueItem(EngineAQueueItemDto q) => new()
    {
        OrderId          = q.OrderId,
        OrderNumber      = q.OrderNumber,
        ClientPhone      = q.ClientPhone,
        ClientName       = q.ClientName,
        ClientOrderCount = q.ClientOrderCount,
        IsNewClient      = q.IsNewClient,
        Wilaya           = q.Wilaya,
        Amount           = q.Amount,
        Risk             = q.Risk,
        Status           = q.Status,
        WaitingMinutes   = q.WaitingMinutes,
    };

    private static CodFunnelDto MapFunnel(EngineAFunnelDto f) => new()
    {
        TotalOrders = f.TotalOrders,
        Passees     = MapStep(f.Passees),
        Confirmees  = MapStep(f.Confirmees),
        Expediees   = MapStep(f.Expediees),
        Livrees     = MapStep(f.Livrees),
        Remises     = MapStep(f.Remises),
        Retournees  = MapStep(f.Retournees),
    };

    private static FunnelStep MapStep(EngineAFunnelStepDto s) =>
        new() { Count = s.Count, Percentage = s.Percentage };

    private static RiskScoreDto MapRisk(EngineARiskDto r) => new()
    {
        TotalOrders = r.TotalOrders,
        FaibleCount = r.FaibleCount, FaiblePct = r.FaiblePct,
        MoyenCount  = r.MoyenCount,  MoyenPct  = r.MoyenPct,
        EleveCount  = r.EleveCount,  ElevePct  = r.ElevePct,
    };
}
