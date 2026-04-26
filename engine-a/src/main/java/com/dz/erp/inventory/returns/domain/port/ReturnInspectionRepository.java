package com.dz.erp.inventory.returns.domain.port;

import com.dz.erp.inventory.returns.domain.model.InspectionStatus;
import com.dz.erp.inventory.returns.domain.model.ReturnInspection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface ReturnInspectionRepository {
    ReturnInspection save(ReturnInspection inspection);
    Optional<ReturnInspection> findById(String inspectionId, String tenantId);
    Page<ReturnInspection> findByTenant(String tenantId, InspectionStatus status, Pageable pageable);
}
