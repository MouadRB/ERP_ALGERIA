package com.dz.erp.oms.order.domain.port;

/**
 * Outbound port for publishing order domain events. Shape is identical to
 * {@code pim.product.domain.port.ProductEventPort}: a single method that takes
 * the eventType, aggregateId, and the event payload. The adapter writes a row
 * into the shared transactional outbox and fans the event out to in-process
 * {@code @EventListener}s via {@code DomainEventPublisher}.
 */
public interface OrderEventPort {
    void publish(String eventType, String aggregateId, Object event);
}
