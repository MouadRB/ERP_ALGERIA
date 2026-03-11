package com.dz.erp.mdm.wilaya.domain.port;

import com.dz.erp.mdm.wilaya.domain.model.WilayaConfig;
import com.dz.erp.mdm.wilaya.domain.model.WilayaStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface WilayaRepository {
    WilayaConfig save(WilayaConfig w);

    Optional<WilayaConfig> findByWilayaCode(String code, String tenantId);

    boolean existsByWilayaCode(String code, String tenantId);

    Page<WilayaConfig> search(String zone, Boolean deliverable, WilayaStatus status, String tenantId, Pageable pageable);

    List<WilayaConfig> findDeliverable(String tenantId);
}
