package com.dz.erp.pim.variant.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;
import java.util.Optional;

public interface VariantAttributeSpringDataRepository extends JpaRepository<VariantAttributeJpaEntity, String> {
    Optional<VariantAttributeJpaEntity> findByAttributeIdAndTenantId(String attributeId, String tenantId);

    List<VariantAttributeJpaEntity> findByVariantIdAndTenantIdOrderBySortOrder(String variantId, String tenantId);

    List<VariantAttributeJpaEntity> findByKeyAndValueFrAndTenantId(String key, String valueFr, String tenantId);

    @Modifying
    void deleteByVariantIdAndTenantId(String variantId, String tenantId);}
