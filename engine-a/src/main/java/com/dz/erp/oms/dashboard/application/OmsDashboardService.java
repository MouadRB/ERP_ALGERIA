package com.dz.erp.oms.dashboard.application;

import com.dz.erp.inventory.alert.domain.port.StockAlertRepository;
import com.dz.erp.oms.dashboard.application.dto.OmsDashboardResponse;
import com.dz.erp.oms.dashboard.application.dto.OmsDashboardResponse.Funnel;
import com.dz.erp.oms.dashboard.application.dto.OmsDashboardResponse.FunnelStep;
import com.dz.erp.oms.dashboard.application.dto.OmsDashboardResponse.Kpis;
import com.dz.erp.oms.dashboard.application.dto.OmsDashboardResponse.QueueItem;
import com.dz.erp.oms.dashboard.application.dto.OmsDashboardResponse.Risk;
import com.dz.erp.oms.order.domain.model.OrderStatus;
import com.dz.erp.oms.order.infrastructure.persistence.OrderJpaEntity;
import com.dz.erp.oms.order.infrastructure.persistence.OrderSpringDataRepository;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * Aggregates the COD operator dashboard payload from order + alert state.
 *
 * <p>Funnel buckets are computed from the order's lifecycle timestamps
 * ({@code confirmedAt}, {@code shippedAt}, {@code deliveredAt}, {@code closedAt})
 * rather than current-status alone — this gives the right monotonicity even when
 * an order has already moved past a step (e.g. a CONFIRMED-then-SHIPPED order
 * still counts toward {@code confirmees}).
 *
 * <p>Risk buckets are derived from {@code grandTotalTtc} as a deterministic stand-in
 * — engine-a's Order has no risk field today.
 */
@Service
@RequiredArgsConstructor
public class OmsDashboardService {

    private static final ZoneId ZONE = ZoneId.of("Africa/Algiers");

    private static final Set<OrderStatus> PENDING_STATUSES = EnumSet.of(
            OrderStatus.RECEIVED, OrderStatus.VALIDATED, OrderStatus.RESERVED);

    private static final BigDecimal RISK_LOW_MAX  = new BigDecimal("5000");
    private static final BigDecimal RISK_HIGH_MIN = new BigDecimal("20000");

    private final OrderSpringDataRepository orderRepo;
    private final StockAlertRepository alertRepo;

    @Transactional(readOnly = true)
    public OmsDashboardResponse getDashboard() {
        var tenantId = AuthContext.currentTenantId();
        var now = LocalDateTime.now(ZONE);
        var today = LocalDate.now(ZONE);
        var startToday  = today.atStartOfDay();
        var startTomor  = today.plusDays(1).atStartOfDay();
        var startYest   = today.minusDays(1).atStartOfDay();
        var startWeek   = today.minusDays(7).atStartOfDay();
        var startTwoWk  = today.minusDays(14).atStartOfDay();

        return new OmsDashboardResponse(
                buildKpis(tenantId, now, startToday, startTomor, startYest, startWeek, startTwoWk),
                buildQueue(tenantId, now),
                buildFunnel(tenantId, startToday, startTomor),
                buildRisk(tenantId, startToday, startTomor)
        );
    }

    // ── KPIs ─────────────────────────────────────────────────────────────────
    private Kpis buildKpis(String tenantId, LocalDateTime now,
                           LocalDateTime startToday, LocalDateTime startTomor,
                           LocalDateTime startYest, LocalDateTime startWeek,
                           LocalDateTime startTwoWk) {
        long ordersToday     = orderRepo.countByTenantIdAndPlacedAtBetween(tenantId, startToday, startTomor);
        long ordersYesterday = orderRepo.countByTenantIdAndPlacedAtBetween(tenantId, startYest, startToday);

        var pending = orderRepo.findByTenantIdAndStatusInOrderByPlacedAtAsc(tenantId, PENDING_STATUSES);
        int maxWait = pending.stream()
                .mapToInt(o -> (int) Duration.between(o.getPlacedAt(), now).toMinutes())
                .max().orElse(0);

        long deliveredWeek = orderRepo.countByTenantIdAndDeliveredAtBetween(tenantId, startWeek, startTomor);
        long returnedWeek  = orderRepo.countByTenantIdAndStatusAndPlacedAtBetween(
                tenantId, OrderStatus.RETURNED, startWeek, startTomor);
        BigDecimal deliveryRate = pct(deliveredWeek, deliveredWeek + returnedWeek, 1);

        long deliveredPrevWeek = orderRepo.countByTenantIdAndDeliveredAtBetween(tenantId, startTwoWk, startWeek);
        long returnedPrevWeek  = orderRepo.countByTenantIdAndStatusAndPlacedAtBetween(
                tenantId, OrderStatus.RETURNED, startTwoWk, startWeek);
        BigDecimal prevRate    = pct(deliveredPrevWeek, deliveredPrevWeek + returnedPrevWeek, 1);
        BigDecimal weekTrend   = deliveryRate.subtract(prevRate);

        var alerts = alertRepo.findActive(tenantId);
        int outOfStock = alerts.size();
        Instant todayInstant = startToday.atZone(ZONE).toInstant();
        int newOosToday = (int) alerts.stream()
                .filter(a -> a.getTriggeredAt() != null && !a.getTriggeredAt().isBefore(todayInstant))
                .count();

        BigDecimal vsPct = ordersYesterday > 0
                ? pct(ordersToday - ordersYesterday, ordersYesterday, 1)
                : BigDecimal.ZERO;

        return new Kpis(
                (int) ordersToday, vsPct,
                pending.size(), maxWait,
                deliveryRate, weekTrend,
                outOfStock, newOosToday);
    }

    // ── Confirmation queue ───────────────────────────────────────────────────
    private List<QueueItem> buildQueue(String tenantId, LocalDateTime now) {
        return orderRepo.findByTenantIdAndStatusInOrderByPlacedAtAsc(tenantId, PENDING_STATUSES).stream()
                .map(o -> toQueueItem(tenantId, now, o))
                .toList();
    }

    private QueueItem toQueueItem(String tenantId, LocalDateTime now, OrderJpaEntity o) {
        var addr = o.getShippingAddress();
        long history = orderRepo.countByTenantIdAndCustomerId(tenantId, o.getCustomerId());
        // history includes this order; previous orders = history - 1
        int previous = (int) Math.max(0, history - 1);
        int wilaya = parseWilaya(addr != null ? addr.getWilayaCode() : null);
        int wait = (int) Duration.between(o.getPlacedAt(), now).toMinutes();
        return new QueueItem(
                o.getOrderId(),
                "#" + o.getOrderId().toString().substring(0, 8),
                addr != null ? safe(addr.getPhone()) : "",
                addr != null ? safe(addr.getRecipientName()) : "",
                previous,
                previous == 0,
                wilaya,
                o.getGrandTotalTtc(),
                riskLabel(o.getGrandTotalTtc()),
                o.getStatus().name(),
                wait
        );
    }

    // ── COD funnel ───────────────────────────────────────────────────────────
    private Funnel buildFunnel(String tenantId, LocalDateTime startToday, LocalDateTime startTomor) {
        long total = orderRepo.countByTenantIdAndPlacedAtBetween(tenantId, startToday, startTomor);
        if (total == 0) {
            var zero = new FunnelStep(0, BigDecimal.ZERO);
            return new Funnel(0, zero, zero, zero, zero, zero, zero);
        }

        long confirmees = orderRepo.countByTenantIdAndPlacedAtBetweenAndConfirmedAtNotNull(tenantId, startToday, startTomor);
        long expediees  = orderRepo.countByTenantIdAndPlacedAtBetweenAndShippedAtNotNull(tenantId, startToday, startTomor);
        long livrees    = orderRepo.countByTenantIdAndPlacedAtBetweenAndDeliveredAtNotNull(tenantId, startToday, startTomor);
        long remises    = orderRepo.countByTenantIdAndStatusAndPlacedAtBetween(
                tenantId, OrderStatus.COMPLETED, startToday, startTomor);
        long retournees = orderRepo.countByTenantIdAndStatusAndPlacedAtBetween(
                tenantId, OrderStatus.RETURNED, startToday, startTomor);

        return new Funnel(
                (int) total,
                new FunnelStep((int) total,      pct(total, total, 0)),
                new FunnelStep((int) confirmees, pct(confirmees, total, 0)),
                new FunnelStep((int) expediees,  pct(expediees, total, 0)),
                new FunnelStep((int) livrees,    pct(livrees, total, 0)),
                new FunnelStep((int) remises,    pct(remises, total, 0)),
                new FunnelStep((int) retournees, pct(retournees, total, 0))
        );
    }

    // ── Risk donut ───────────────────────────────────────────────────────────
    private Risk buildRisk(String tenantId, LocalDateTime startToday, LocalDateTime startTomor) {
        var todays = orderRepo.findByTenantIdAndPlacedAtBetweenOrderByPlacedAtAsc(
                tenantId, startToday, startTomor);

        int total = todays.size();
        if (total == 0) return new Risk(0, 0, BigDecimal.ZERO, 0, BigDecimal.ZERO, 0, BigDecimal.ZERO);

        int faible = 0, moyen = 0, eleve = 0;
        for (var o : todays) {
            switch (riskLabel(o.getGrandTotalTtc())) {
                case "Faible" -> faible++;
                case "Moyen"  -> moyen++;
                case "Eleve"  -> eleve++;
            }
        }
        return new Risk(
                total,
                faible, pct(faible, total, 0),
                moyen,  pct(moyen, total, 0),
                eleve,  pct(eleve, total, 0));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private static String riskLabel(BigDecimal amount) {
        if (amount == null) return "Faible";
        if (amount.compareTo(RISK_LOW_MAX)  < 0) return "Faible";
        if (amount.compareTo(RISK_HIGH_MIN) < 0) return "Moyen";
        return "Eleve";
    }

    private static BigDecimal pct(long part, long total, int scale) {
        if (total <= 0) return BigDecimal.ZERO;
        return BigDecimal.valueOf(part)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(total), scale, RoundingMode.HALF_UP);
    }

    private static int parseWilaya(String code) {
        if (code == null || code.isBlank()) return 0;
        try { return Integer.parseInt(code.trim()); }
        catch (NumberFormatException e) { return 0; }
    }

    private static String safe(String s) { return s == null ? "" : s; }
}
