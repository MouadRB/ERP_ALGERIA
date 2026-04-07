package com.dz.erp.pim.variant.infrastructure.persistence;

import com.dz.erp.pim.variant.domain.model.Variant;
import com.dz.erp.pim.variant.domain.port.VariantRepository;
import com.dz.erp.pim.variant.infrastructure.mapper.VariantPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class VariantRepositoryAdapter implements VariantRepository {
    private final VariantSpringDataRepository jpa;
    private final VariantPersistenceMapper m;

    @Override
    public Variant save(Variant v) {
        return m.toDomain(jpa.save(m.toJpa(v)));
    }

    @Override
    public Optional<Variant> findById(String id, String tid) {
        return jpa.findByVariantIdAndTenantId(id, tid).map(m::toDomain);
    }

    @Override
    public Optional<Variant> findBySkuCode(String sku, String tid) {
        return jpa.findBySkuCodeAndTenantId(sku, tid).map(m::toDomain);
    }

    @Override
    public List<Variant> findByProductId(String pid, String tid) {
        return jpa.findByProductIdAndTenantIdOrderByLabel(pid, tid).stream().map(m::toDomain).toList();
    }

    @Override
    public boolean existsBySkuCode(String sku, String tid) {
        return jpa.existsBySkuCodeAndTenantId(sku, tid);
    }

    @Override
    public void delete(Variant v) {
        jpa.deleteById(v.getVariantId());
    }

    @Override
    public void deleteByProductIdAndTenantId(String productId, String tenantId) {
        jpa.deleteByProductIdAndTenantId(productId, tenantId);
    }

}
