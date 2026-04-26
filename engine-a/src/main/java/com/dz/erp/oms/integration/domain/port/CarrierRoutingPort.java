package com.dz.erp.oms.integration.domain.port;

import java.util.Optional;

/**
 * Resolves which carrier code a given shipping wilaya should be routed to. Rules are
 * tenant-scoped and stored in the {@code oms_schema.carrier_router_rules} table (JPA
 * managed — schema is driven by {@code ddl-auto: update} so the original V4 Flyway
 * migration is no longer needed).
 *
 * <p>If no rule matches the tenant+wilaya pair, callers fall back to
 * {@code oms.integration.default-carrier}.
 */
public interface CarrierRoutingPort {

    /**
     * @return the carrier code to use for the given tenant+wilaya, or {@link Optional#empty()}
     *         when no explicit rule applies.
     */
    Optional<String> resolveCarrierCode(String tenantId, String wilayaCode);
}
