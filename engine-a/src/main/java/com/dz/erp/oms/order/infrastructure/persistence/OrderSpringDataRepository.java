package com.dz.erp.oms.order.infrastructure.persistence;

import com.dz.erp.oms.order.domain.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data interface wrapping the {@code oms_schema.orders} table.
 *
 * <p>Kept to the strict minimum — each method maps to one call in
 * {@link com.dz.erp.oms.order.domain.port.OrderRepositoryPort}. All queries are
 * tenant-scoped because the port contract requires it.
 */
@Repository
public interface OrderSpringDataRepository extends JpaRepository<OrderJpaEntity, UUID> {

    Optional<OrderJpaEntity> findByOrderIdAndTenantId(UUID orderId, String tenantId);

    Optional<OrderJpaEntity> findByTenantIdAndChannelCodeAndIdempotencyKey(
            String tenantId, String channelCode, String idempotencyKey);

    Page<OrderJpaEntity> findByTenantIdOrderByPlacedAtDesc(String tenantId, Pageable pageable);

    long countByTenantId(String tenantId);

    @Query("""
           SELECT o FROM OrderJpaEntity o
            WHERE o.status = 'RECEIVED'
              AND o.placedAt <= :olderThan
            ORDER BY o.placedAt ASC
           """)
    List<OrderJpaEntity> findStaleReceived(@Param("olderThan") LocalDateTime olderThan, Pageable pageable);

    // ── Dashboard aggregations ───────────────────────────────────────────────

    long countByTenantIdAndPlacedAtBetween(String tenantId, LocalDateTime from, LocalDateTime to);

    long countByTenantIdAndPlacedAtBetweenAndConfirmedAtNotNull(
            String tenantId, LocalDateTime from, LocalDateTime to);

    long countByTenantIdAndPlacedAtBetweenAndShippedAtNotNull(
            String tenantId, LocalDateTime from, LocalDateTime to);

    long countByTenantIdAndPlacedAtBetweenAndDeliveredAtNotNull(
            String tenantId, LocalDateTime from, LocalDateTime to);

    long countByTenantIdAndDeliveredAtBetween(
            String tenantId, LocalDateTime from, LocalDateTime to);

    long countByTenantIdAndStatusAndPlacedAtBetween(
            String tenantId, OrderStatus status, LocalDateTime from, LocalDateTime to);

    List<OrderJpaEntity> findByTenantIdAndStatusInOrderByPlacedAtAsc(
            String tenantId, Collection<OrderStatus> statuses);

    List<OrderJpaEntity> findByTenantIdAndPlacedAtBetweenOrderByPlacedAtAsc(
            String tenantId, LocalDateTime from, LocalDateTime to);

    long countByTenantIdAndCustomerId(String tenantId, String customerId);
}
