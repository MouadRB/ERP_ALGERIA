package com.dz.erp.oms.dashboard.application.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Aggregated payload powering engine-b's COD operator dashboard.
 *
 * <p>Single round-trip response — engine-b calls {@code GET /oms/v1/dashboard} and
 * shapes each block into its own DTO. Engine-a is the source of truth for orders;
 * engine-b's dashboard module is now a thin presentation layer over this payload.
 */
public record OmsDashboardResponse(
        Kpis kpis,
        List<QueueItem> confirmationQueue,
        Funnel codFunnel,
        Risk riskScore
) {

    public record Kpis(
            int ordersToday,
            BigDecimal ordersVsYesterdayPct,
            int pendingConfirmation,
            int maxWaitMinutes,
            BigDecimal deliveryRatePct,
            BigDecimal deliveryRateWeekTrendPct,
            int outOfStockArticles,
            int newOutOfStockToday
    ) {}

    public record QueueItem(
            UUID orderId,
            String orderNumber,
            String clientPhone,
            String clientName,
            int clientOrderCount,
            boolean isNewClient,
            int wilaya,
            BigDecimal amount,
            String risk,
            String status,
            int waitingMinutes
    ) {}

    public record Funnel(
            int totalOrders,
            FunnelStep passees,
            FunnelStep confirmees,
            FunnelStep expediees,
            FunnelStep livrees,
            FunnelStep remises,
            FunnelStep retournees
    ) {}

    public record FunnelStep(int count, BigDecimal percentage) {}

    public record Risk(
            int totalOrders,
            int faibleCount, BigDecimal faiblePct,
            int moyenCount,  BigDecimal moyenPct,
            int eleveCount,  BigDecimal elevePct
    ) {}
}
