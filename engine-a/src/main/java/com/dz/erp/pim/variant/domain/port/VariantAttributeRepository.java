package com.dz.erp.pim.variant.domain.port;

import com.dz.erp.pim.variant.domain.model.VariantAttribute;

import java.util.List;
import java.util.Optional;

public interface VariantAttributeRepository {
    VariantAttribute save(VariantAttribute attribute);

    Optional<VariantAttribute> findById(String attributeId, String tenantId);

    List<VariantAttribute> findByVariantId(String variantId, String tenantId);

    void deleteByProductIdAndTenantId(String variantId, String tenantId);

    void delete(String attributeId);

}
