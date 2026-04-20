package com.dz.erp.inventory.returns.infrastructure.persistence;

import com.dz.erp.inventory.returns.domain.model.InspectionStatus;
import com.dz.erp.inventory.returns.domain.model.ReturnInspection;
import com.dz.erp.inventory.returns.domain.port.ReturnInspectionRepository;
import com.dz.erp.inventory.returns.infrastructure.mapper.ReturnInspectionPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ReturnInspectionRepositoryAdapter implements ReturnInspectionRepository {
    private final ReturnInspectionSpringDataRepository jpa;
    private final ReturnInspectionPersistenceMapper m;

    @Override
    public ReturnInspection save(ReturnInspection r) {
        return m.toDomain(jpa.save(m.toJpa(r)));
    }

    @Override
    public Optional<ReturnInspection> findById(String inspectionId, String tenantId) {
        return jpa.findByInspectionIdAndTenantId(inspectionId, tenantId).map(m::toDomain);
    }

    @Override
    public Page<ReturnInspection> findByTenant(String tenantId, InspectionStatus status, Pageable pageable) {
        return jpa.findByTenant(tenantId, status != null ? status.name() : null, pageable).map(m::toDomain);
    }
}
