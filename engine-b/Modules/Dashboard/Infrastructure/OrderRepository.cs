using engine_b.Common.Infrastructure.Data;
using engine_b.Modules.Dashboard.Application.Dtos;
using engine_b.Modules.Dashboard.Domain;
using Microsoft.EntityFrameworkCore;

namespace engine_b.Modules.Dashboard.Infrastructure;

public class OrderRepository(AppDbContext db)
{
    private static readonly DateTime Today = DateTime.UtcNow.Date;
    private static readonly DateTime Yesterday = DateTime.UtcNow.Date.AddDays(-1);
    private static readonly DateTime WeekAgo = DateTime.UtcNow.Date.AddDays(-7);

    // ── KPI card data ────────────────────────────────────────────────────────
    public async Task<DashboardKpiDto> GetKpisAsync()
    {
        var ordersToday    = await db.Orders.CountAsync(o => o.CreatedAt >= Today);
        var ordersYesterday = await db.Orders.CountAsync(o =>
            o.CreatedAt >= Yesterday && o.CreatedAt < Today);

        var pending = await db.Orders
            .Where(o => o.Status == OrderStatus.EnAttente)
            .ToListAsync();

        var maxWait = pending.Count > 0
            ? (int)pending.Max(o => (DateTime.UtcNow - o.CreatedAt).TotalMinutes)
            : 0;

        // Delivery rate: delivered / (delivered + returned) this week
        var deliveredThisWeek = await db.Orders.CountAsync(o =>
            o.Status == OrderStatus.Livree && o.DeliveredAt >= WeekAgo);
        var returnedThisWeek = await db.Orders.CountAsync(o =>
            o.Status == OrderStatus.Retournee && o.CreatedAt >= WeekAgo);
        var deliveryTotal = deliveredThisWeek + returnedThisWeek;
        var deliveryRate = deliveryTotal > 0
            ? Math.Round((decimal)deliveredThisWeek / deliveryTotal * 100, 1)
            : 0;

        // Previous week for trend
        var twoWeeksAgo = WeekAgo.AddDays(-7);
        var deliveredPrevWeek = await db.Orders.CountAsync(o =>
            o.Status == OrderStatus.Livree && o.DeliveredAt >= twoWeeksAgo && o.DeliveredAt < WeekAgo);
        var returnedPrevWeek = await db.Orders.CountAsync(o =>
            o.Status == OrderStatus.Retournee && o.CreatedAt >= twoWeeksAgo && o.CreatedAt < WeekAgo);
        var prevTotal = deliveredPrevWeek + returnedPrevWeek;
        var prevRate = prevTotal > 0 ? Math.Round((decimal)deliveredPrevWeek / prevTotal * 100, 1) : 0;
        var weekTrend = deliveryRate - prevRate;

        // Out-of-stock
        var outOfStock = await db.StockAlerts.CountAsync(s => !s.IsResolved);
        var newOosToday = await db.StockAlerts.CountAsync(s => !s.IsResolved && s.DetectedAt >= Today);

        var vsPct = ordersYesterday > 0
            ? Math.Round((decimal)(ordersToday - ordersYesterday) / ordersYesterday * 100, 1)
            : 0;

        return new DashboardKpiDto
        {
            OrdersToday              = ordersToday,
            OrdersVsYesterdayPct     = vsPct,
            PendingConfirmation      = pending.Count,
            MaxWaitMinutes           = maxWait,
            DeliveryRatePct          = deliveryRate,
            DeliveryRateWeekTrendPct = weekTrend,
            OutOfStockArticles       = outOfStock,
            NewOutOfStockToday       = newOosToday,
        };
    }

    // ── Confirmation queue ───────────────────────────────────────────────────
    public async Task<List<ConfirmationQueueItemDto>> GetConfirmationQueueAsync()
    {
        var now = DateTime.UtcNow;
        return await db.Orders
            .Where(o => o.Status == OrderStatus.EnAttente)
            .OrderBy(o => o.CreatedAt) // oldest first (longest wait)
            .Select(o => new ConfirmationQueueItemDto
            {
                OrderId          = o.Id,
                OrderNumber      = o.OrderNumber,
                ClientPhone      = o.ClientPhone,
                ClientName       = o.ClientName,
                ClientOrderCount = o.ClientOrderCount,
                IsNewClient      = o.IsNewClient,
                Wilaya           = o.Wilaya,
                Amount           = o.Amount,
                Risk             = o.Risk.ToString(),
                Status           = o.Status.ToString(),
                WaitingMinutes   = (int)(now - o.CreatedAt).TotalMinutes,
            })
            .ToListAsync();
    }

    // ── COD funnel ───────────────────────────────────────────────────────────
    public async Task<CodFunnelDto> GetCodFunnelAsync()
    {
        var todayOrders = db.Orders.Where(o => o.CreatedAt >= Today);
        var total = await todayOrders.CountAsync();

        if (total == 0) return new CodFunnelDto();

        var passees     = total; // all placed orders
        var confirmees  = await todayOrders.CountAsync(o => o.Status >= OrderStatus.Confirmee);
        var expediees   = await todayOrders.CountAsync(o => o.Status >= OrderStatus.Expediee);
        var livrees     = await todayOrders.CountAsync(o => o.Status >= OrderStatus.Livree);
        var remises     = await todayOrders.CountAsync(o => o.Status >= OrderStatus.Remise);
        var retournees  = await todayOrders.CountAsync(o => o.Status == OrderStatus.Retournee);

        return new CodFunnelDto
        {
            TotalOrders = total,
            Passees     = new FunnelStep { Count = passees,    Percentage = 100 },
            Confirmees  = new FunnelStep { Count = confirmees, Percentage = Pct(confirmees, total) },
            Expediees   = new FunnelStep { Count = expediees,  Percentage = Pct(expediees, total) },
            Livrees     = new FunnelStep { Count = livrees,    Percentage = Pct(livrees, total) },
            Remises     = new FunnelStep { Count = remises,    Percentage = Pct(remises, total) },
            Retournees  = new FunnelStep { Count = retournees, Percentage = Pct(retournees, total) },
        };
    }

    // ── Risk score donut ─────────────────────────────────────────────────────
    public async Task<RiskScoreDto> GetRiskScoreAsync()
    {
        var todayOrders = db.Orders.Where(o => o.CreatedAt >= Today);
        var total = await todayOrders.CountAsync();

        if (total == 0) return new RiskScoreDto();

        var faible = await todayOrders.CountAsync(o => o.Risk == OrderRisk.Faible);
        var moyen  = await todayOrders.CountAsync(o => o.Risk == OrderRisk.Moyen);
        var eleve  = await todayOrders.CountAsync(o => o.Risk == OrderRisk.Eleve);

        return new RiskScoreDto
        {
            TotalOrders = total,
            FaibleCount = faible, FaiblePct = Pct(faible, total),
            MoyenCount  = moyen,  MoyenPct  = Pct(moyen, total),
            EleveCount  = eleve,  ElevePct  = Pct(eleve, total),
        };
    }

    // ── Order CRUD ───────────────────────────────────────────────────────────
    public async Task<Order?> GetByIdAsync(Guid id) => await db.Orders.FindAsync(id);

    public async Task UpdateAsync(Order order)
    {
        db.Orders.Update(order);
        await db.SaveChangesAsync();
    }

    public async Task AddAsync(Order order)
    {
        db.Orders.Add(order);
        await db.SaveChangesAsync();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private static decimal Pct(int part, int total) =>
        total > 0 ? Math.Round((decimal)part / total * 100, 0) : 0;
}
