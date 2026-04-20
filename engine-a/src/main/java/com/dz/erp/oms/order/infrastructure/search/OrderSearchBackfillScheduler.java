package com.dz.erp.oms.order.infrastructure.search;

import com.dz.erp.oms.order.domain.port.OrderRepositoryPort;
import com.dz.erp.oms.order.domain.port.OrderSearchPort;
import com.dz.erp.shared.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Stage 11 — periodic best-effort backfill. Walks the most recent orders and upserts
 * their documents. Meant for first-time bootstrap and for recovering from an
 * OpenSearch outage; intentionally simple — a real operational backfill would page
 * through {@code findRecent} by tenant with cursored iteration.
 *
 * <p>Disabled by default. Toggle {@code oms.search.backfill.enabled=true} to run.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "oms.search.backfill", name = "enabled", havingValue = "true")
public class OrderSearchBackfillScheduler {

    private final OrderRepositoryPort orderRepo;
    private final OrderSearchPort searchPort;

    @Value("${oms.search.backfill.batch-size:200}")
    private int batchSize;

    @Value("${oms.search.backfill.tenant:default}")
    private String tenant;

    @Scheduled(fixedDelayString = "${oms.search.backfill.fixed-delay-ms:300000}")
    @Transactional(readOnly = true)
    public void run() {
        var prev = TenantContext.getTenantId();
        TenantContext.setTenantId(tenant);
        try {
            var orders = orderRepo.findRecent(tenant, 0, batchSize);
            log.info("OMS search backfill: reindexing {} orders for tenant {}", orders.size(), tenant);
            for (var o : orders) {
                searchPort.upsert(o.getOrderId(), OrderSearchDocumentBuilder.toDocument(o));
            }
        } catch (Exception ex) {
            log.warn("OMS search backfill run failed: {}", ex.getMessage());
        } finally {
            TenantContext.setTenantId(prev);
        }
    }
}
