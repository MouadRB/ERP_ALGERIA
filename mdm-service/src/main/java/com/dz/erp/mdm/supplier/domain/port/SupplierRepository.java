package com.dz.erp.mdm.supplier.domain.port;

import com.dz.erp.mdm.supplier.domain.model.Supplier;
import com.dz.erp.mdm.supplier.domain.model.SupplierStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface SupplierRepository {
    Supplier save(Supplier supplier);

    Optional<Supplier> findBySupplierCode(String code, String tenantId);

    boolean existsBySupplierCode(String code, String tenantId);

    Page<Supplier> search(String search, SupplierStatus status, String wilayaCode, String tenantId, Pageable pageable);
}
