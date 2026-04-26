package com.dz.erp.oms.integration.domain.port;

import java.util.Optional;
import java.util.UUID;

/**
 * Integration-local port used by {@code ShipmentSubmissionService} to learn the
 * shipping wilaya of an order without importing {@code order.domain} (the ArchUnit
 * rule {@code order_submodule_domain_is_private} blocks cross-submodule imports).
 *
 * <p>Implemented via a native SQL query against {@code oms_schema.orders} — see
 * {@code OrderWilayaLookupAdapter}.
 */
public interface OrderWilayaLookupPort {

    Optional<String> findShippingWilaya(String tenantId, UUID orderId);
}
