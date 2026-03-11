package com.dz.erp.mdm.supplier.infrastructure.persistence;

import com.dz.erp.mdm.supplier.domain.model.Supplier;
import com.dz.erp.mdm.supplier.domain.model.SupplierStatus;
import com.dz.erp.mdm.supplier.domain.port.SupplierRepository;
import com.dz.erp.mdm.supplier.infrastructure.mapper.SupplierPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SupplierRepositoryAdapter implements SupplierRepository {
    private final SupplierSpringDataRepository jpa;
    private final SupplierPersistenceMapper mapper;

    @Override
    public Supplier save(Supplier s) {
        return mapper.toDomain(jpa.save(mapper.toJpa(s)));
    }

    @Override
    public Optional<Supplier> findBySupplierCode(String c, String t) {
        return jpa.findBySupplierCodeAndTenantId(c, t).map(mapper::toDomain);
    }

    @Override
    public boolean existsBySupplierCode(String c, String t) {
        return jpa.existsBySupplierCodeAndTenantId(c, t);
    }

    @Override
    public Page<Supplier> search(String s, SupplierStatus st, String w, String t, Pageable p) {
        return jpa.search(s, st, w, t, p).map(mapper::toDomain);
    }
}
