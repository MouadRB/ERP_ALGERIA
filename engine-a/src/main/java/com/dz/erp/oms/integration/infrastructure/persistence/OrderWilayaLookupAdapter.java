package com.dz.erp.oms.integration.infrastructure.persistence;

import com.dz.erp.oms.integration.domain.port.OrderWilayaLookupPort;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/**
 * Reads a single scalar (shipping wilaya) from {@code oms_schema.orders} via native
 * SQL so the integration submodule does not depend on {@code order.domain} — per the
 * {@code order_submodule_domain_is_private} ArchUnit rule.
 */
@Component
public class OrderWilayaLookupAdapter implements OrderWilayaLookupPort {

    @PersistenceContext
    private EntityManager em;

    @Override
    @Transactional(readOnly = true)
    public Optional<String> findShippingWilaya(String tenantId, UUID orderId) {
        var results = em.createNativeQuery("""
                        SELECT shipping_wilaya_code FROM oms_schema.orders
                        WHERE order_id = :orderId AND tenant_id = :tenantId
                        """)
                .setParameter("orderId", orderId)
                .setParameter("tenantId", tenantId)
                .getResultList();
        if (results.isEmpty() || results.get(0) == null) return Optional.empty();
        return Optional.of(results.get(0).toString());
    }
}
