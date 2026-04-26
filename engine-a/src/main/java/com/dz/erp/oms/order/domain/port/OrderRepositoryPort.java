package com.dz.erp.oms.order.domain.port;

import com.dz.erp.oms.order.domain.model.Order;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Outbound port for Order persistence. Infrastructure provides a JPA adapter.
 *
 * <p>Tenant-scoping is applied by every method — callers pass the tenant id from
 * {@code AuthContext.currentTenantId()}; the adapter enforces the predicate in SQL.
 */
public interface OrderRepositoryPort {

    /** Persist a new order or update an existing one. Returns the stored aggregate. */
    Order save(Order order);

    /** Look up by order id, tenant-scoped. */
    Optional<Order> findById(String tenantId, UUID orderId);

    /**
     * Idempotency lookup: does an order already exist for
     * {@code (tenantId, channelCode, idempotencyKey)}? Called by the intake service
     * before creating a new aggregate — see {@code docs/OMS_MODULE.md} §3.3.
     */
    Optional<Order> findByIdempotencyKey(String tenantId, String channelCode, String idempotencyKey);

    /** Paged list for the admin/CS listing endpoint. */
    List<Order> findRecent(String tenantId, int page, int size);

    /** Total order count for the tenant — feeds the {@code ApiResult} pagination block. */
    long countForTenant(String tenantId);

    /**
     * Find orders still stuck in {@code RECEIVED} because MDM was unavailable at
     * intake. Tenant-agnostic because the scheduled revalidator is a system
     * process — the caller installs the appropriate {@code TenantContext} per row.
     *
     * @param olderThan only return orders whose {@code placedAt} is on or before this
     * @param limit     hard cap to avoid pulling the whole table during an outage
     */
    List<Order> findStaleReceived(LocalDateTime olderThan, int limit);
}
