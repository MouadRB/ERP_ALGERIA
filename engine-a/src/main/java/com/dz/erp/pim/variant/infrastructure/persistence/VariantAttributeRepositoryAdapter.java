package com.dz.erp.pim.variant.infrastructure.persistence;

import com.dz.erp.pim.variant.domain.model.VariantAttribute;
import com.dz.erp.pim.variant.domain.port.VariantAttributeRepository;
import com.dz.erp.pim.variant.infrastructure.mapper.VariantAttributePersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class VariantAttributeRepositoryAdapter implements VariantAttributeRepository {

    private final VariantAttributeSpringDataRepository jpa;
    private final VariantAttributePersistenceMapper mapper;

    @Override
    public VariantAttribute save(VariantAttribute attribute) {
        return mapper.toDomain(jpa.save(mapper.toJpa(attribute)));
    }

    @Override
    public Optional<VariantAttribute> findById(String attributeId, String tenantId) {
        return jpa.findByAttributeIdAndTenantId(attributeId, tenantId).map(mapper::toDomain);
    }

    @Override
    public List<VariantAttribute> findByVariantId(String variantId, String tenantId) {
        return jpa.findByVariantIdAndTenantIdOrderBySortOrder(variantId, tenantId).stream()
                .map(mapper::toDomain).toList();
    }


    @Override
    public void delete(String attributeId) {
        jpa.deleteById(attributeId);
    }

    @Override
    public void deleteByProductIdAndTenantId(String variantId, String tenantId) {
        jpa.deleteByVariantIdAndTenantId(variantId, tenantId);
    }


}
