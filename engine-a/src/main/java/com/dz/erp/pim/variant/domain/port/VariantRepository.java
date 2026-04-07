package com.dz.erp.pim.variant.domain.port;

import com.dz.erp.pim.variant.domain.model.Variant;

import java.util.List;
import java.util.Optional;

public interface VariantRepository {
    Variant save(Variant v);

    Optional<Variant> findById(String id, String tid);

    Optional<Variant> findBySkuCode(String sku, String tid);

    List<Variant> findByProductId(String pid, String tid);

    boolean existsBySkuCode(String sku, String tid);

    void delete(Variant v);

    void deleteByProductIdAndTenantId(String productId, String tenantId);
}
