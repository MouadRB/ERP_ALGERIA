package com.dz.erp.mdm.warehouse.domain.port;

import com.dz.erp.mdm.warehouse.domain.model.BinLocation;
import com.dz.erp.mdm.warehouse.domain.model.BinStatus;
import com.dz.erp.mdm.warehouse.domain.model.BinType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface BinRepository {
    BinLocation save(BinLocation bin);

    Optional<BinLocation> findByBinCode(String code, String tenantId);

    boolean existsByBinCode(String code, String tenantId);

    Page<BinLocation> search(String zone, BinType binType, BinStatus status, String tenantId, Pageable pageable);

    List<BinLocation> findAvailable(String zone, String tenantId);
}
