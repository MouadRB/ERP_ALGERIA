package com.dz.erp.mdm.sku.infrastructure.persistence;

import com.dz.erp.mdm.sku.domain.model.Sku;
import com.dz.erp.mdm.sku.domain.model.SkuStatus;
import com.dz.erp.mdm.sku.domain.port.SkuRepository;
import com.dz.erp.mdm.sku.infrastructure.mapper.SkuPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SkuRepositoryAdapter implements SkuRepository {
    private final SkuSpringDataRepository jpa;
    private final SkuPersistenceMapper mapper;

    @Override
    public Sku save(Sku sku) {
        return mapper.toDomain(jpa.save(mapper.toJpa(sku)));
    }

    @Override
    public Optional<Sku> findBySkuCode(String code, String tid) {
        return jpa.findBySkuCodeAndTenantId(code, tid).map(mapper::toDomain);
    }

    @Override
    public boolean existsBySkuCode(String code, String tid) {
        return jpa.existsBySkuCodeAndTenantId(code, tid);
    }

    @Override
    public Page<Sku> search(String s, SkuStatus st, String tid, Pageable p) {
        return jpa.search(s, st, tid, p).map(mapper::toDomain);
    }
}
