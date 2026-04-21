package com.dz.erp.oms.order.infrastructure.search;

import com.dz.erp.oms.order.domain.event.OrderDomainEvent;
import com.dz.erp.oms.order.domain.port.OrderRepositoryPort;
import com.dz.erp.oms.order.domain.port.OrderSearchPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Stage 11 — listens to order lifecycle events (fanned out via
 * {@code DomainEventPublisher} from {@code OrderEventPublisher}) and upserts the
 * denormalized document into {@link OrderSearchPort}.
 *
 * <p>Matches the PIM listener pattern: one {@code @EventListener} per subtype. Each
 * loads the fresh aggregate from the repository so the document always reflects the
 * latest committed state — the outbox write has already happened in the same TX.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderSearchIndexer {

    private final OrderRepositoryPort orderRepo;
    private final OrderSearchPort searchPort;

    @EventListener
    public void onOrderReceived(OrderDomainEvent.OrderReceived e)   { reindex(e.tenantId(), UUID.fromString(e.aggregateId())); }

    @EventListener
    public void onOrderValidated(OrderDomainEvent.OrderValidated e) { reindex(e.tenantId(), UUID.fromString(e.aggregateId())); }

    @EventListener
    public void onOrderRejected(OrderDomainEvent.OrderRejected e)   { reindex(e.tenantId(), UUID.fromString(e.aggregateId())); }

    @EventListener
    public void onOrderReserved(OrderDomainEvent.OrderReserved e)   { reindex(e.tenantId(), UUID.fromString(e.aggregateId())); }

    @EventListener
    public void onOrderConfirmed(OrderDomainEvent.OrderConfirmed e) { reindex(e.tenantId(), UUID.fromString(e.aggregateId())); }

    @EventListener
    public void onOrderCancelled(OrderDomainEvent.OrderCancelled e) { reindex(e.tenantId(), UUID.fromString(e.aggregateId())); }

    @EventListener
    public void onStatusChanged(OrderDomainEvent.OrderStatusChanged e) { reindex(e.tenantId(), UUID.fromString(e.aggregateId())); }

    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    protected void reindex(String tenantId, UUID orderId) {
        try {
            orderRepo.findById(tenantId, orderId).ifPresent(order ->
                    searchPort.upsert(orderId, OrderSearchDocumentBuilder.toDocument(order)));
        } catch (Exception ex) {
            // Indexing failures never break the write path.
            log.warn("Search reindex failed for order {}: {}", orderId, ex.getMessage());
        }
    }
}
