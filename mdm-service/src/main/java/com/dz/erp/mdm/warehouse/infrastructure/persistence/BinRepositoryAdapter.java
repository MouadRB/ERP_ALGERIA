package com.dz.erp.mdm.warehouse.infrastructure.persistence;

import com.dz.erp.mdm.warehouse.domain.model.BinLocation;
import com.dz.erp.mdm.warehouse.domain.model.BinStatus;
import com.dz.erp.mdm.warehouse.domain.model.BinType;
import com.dz.erp.mdm.warehouse.domain.port.BinRepository;
import com.dz.erp.mdm.warehouse.infrastructure.mapper.BinPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class BinRepositoryAdapter implements BinRepository {
    private final BinSpringDataRepository jpa;
    private final BinPersistenceMapper mapper;

    @Override
    public BinLocation save(BinLocation b) {
        return mapper.toDomain(jpa.save(mapper.toJpa(b)));
    }

    @Override
    public Optional<BinLocation> findByBinCode(String c, String t) {
        return jpa.findByBinCodeAndTenantId(c, t).map(mapper::toDomain);
    }

    @Override
    public boolean existsByBinCode(String c, String t) {
        return jpa.existsByBinCodeAndTenantId(c, t);
    }

    @Override
    public List<BinLocation> findAvailable(String z, String t) {
        return jpa.findAvailable(z, t).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Page<BinLocation> search(String z, BinType bt, BinStatus bs, String t, Pageable p) {
        return jpa.search(z, bt, bs, t, p).map(mapper::toDomain);
    }
}
