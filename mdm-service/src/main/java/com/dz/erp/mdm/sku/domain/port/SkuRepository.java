package com.dz.erp.mdm.sku.domain.port;

import com.dz.erp.mdm.sku.domain.model.Sku;
import com.dz.erp.mdm.sku.domain.model.SkuStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface SkuRepository {
    Sku save(Sku sku);
    Optional<Sku> findBySkuCode(String skuCode, String tenantId);
    boolean existsBySkuCode(String skuCode, String tenantId);
    Page<Sku> search(String searchTerm, SkuStatus status, String tenantId, Pageable pageable);
}
