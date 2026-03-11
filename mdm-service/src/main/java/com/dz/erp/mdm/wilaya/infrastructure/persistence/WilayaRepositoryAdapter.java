package com.dz.erp.mdm.wilaya.infrastructure.persistence;

import com.dz.erp.mdm.wilaya.domain.model.WilayaConfig;
import com.dz.erp.mdm.wilaya.domain.model.WilayaStatus;
import com.dz.erp.mdm.wilaya.domain.port.WilayaRepository;
import com.dz.erp.mdm.wilaya.infrastructure.mapper.WilayaPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class WilayaRepositoryAdapter implements WilayaRepository {
    private final WilayaSpringDataRepository jpa;
    private final WilayaPersistenceMapper mapper;

    @Override
    public WilayaConfig save(WilayaConfig w) {
        return mapper.toDomain(jpa.save(mapper.toJpa(w)));
    }

    @Override
    public Optional<WilayaConfig> findByWilayaCode(String c, String t) {
        return jpa.findByWilayaCodeAndTenantId(c, t).map(mapper::toDomain);
    }

    @Override
    public boolean existsByWilayaCode(String c, String t) {
        return jpa.existsByWilayaCodeAndTenantId(c, t);
    }

    @Override
    public List<WilayaConfig> findDeliverable(String t) {
        return jpa.findDeliverable(t).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Page<WilayaConfig> search(String z, Boolean d, WilayaStatus s, String t, Pageable p) {
        return jpa.search(z, d, s, t, p).map(mapper::toDomain);
    }
}
