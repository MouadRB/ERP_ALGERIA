package com.dz.erp.oms.order.infrastructure.persistence;

import com.dz.erp.oms.order.domain.model.Order;
import com.dz.erp.oms.order.domain.port.OrderRepositoryPort;
import com.dz.erp.oms.order.infrastructure.mapper.OrderPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * JPA adapter for {@link OrderRepositoryPort}.
 *
 * <p>Every lookup is tenant-scoped. Saves go through
 * {@link OrderPersistenceMapper#toJpa(Order, OrderJpaEntity)} which reuses the
 * loaded JPA entity on update so optimistic locking via {@code @Version} keeps working.
 */
@Component
@RequiredArgsConstructor
public class OrderRepositoryAdapter implements OrderRepositoryPort {

    private final OrderSpringDataRepository repo;
    private final OrderPersistenceMapper mapper;

    @Override
    public Order save(Order order) {
        OrderJpaEntity existing = repo.findById(order.getOrderId()).orElse(null);
        OrderJpaEntity merged = mapper.toJpa(order, existing);
        return mapper.toDomain(repo.save(merged));
    }

    @Override
    public Optional<Order> findById(String tenantId, UUID orderId) {
        return repo.findByOrderIdAndTenantId(orderId, tenantId).map(mapper::toDomain);
    }

    @Override
    public Optional<Order> findByIdempotencyKey(String tenantId, String channelCode, String idempotencyKey) {
        return repo.findByTenantIdAndChannelCodeAndIdempotencyKey(tenantId, channelCode, idempotencyKey)
                .map(mapper::toDomain);
    }

    @Override
    public List<Order> findRecent(String tenantId, int page, int size) {
        return repo.findByTenantIdOrderByPlacedAtDesc(tenantId, PageRequest.of(page, size))
                .map(mapper::toDomain)
                .getContent();
    }

    @Override
    public long countForTenant(String tenantId) {
        return repo.countByTenantId(tenantId);
    }

    @Override
    public List<Order> findStaleReceived(LocalDateTime olderThan, int limit) {
        return repo.findStaleReceived(olderThan, PageRequest.of(0, Math.max(1, limit))).stream()
                .map(mapper::toDomain)
                .toList();
    }
}
