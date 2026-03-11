package com.dz.erp.mdm.warehouse.infrastructure.persistence;

import com.dz.erp.mdm.warehouse.domain.model.BinStatus;
import com.dz.erp.mdm.warehouse.domain.model.BinType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BinSpringDataRepository extends JpaRepository<BinJpaEntity, String> {
    Optional<BinJpaEntity> findByBinCodeAndTenantId(String code, String tid);

    boolean existsByBinCodeAndTenantId(String code, String tid);

    @Query("SELECT b FROM BinJpaEntity b WHERE b.tenantId = :tid AND b.status = 'ACTIVE' " +
            "AND (:zone IS NULL OR b.zone = :zone) AND (b.maxCapacity - b.currentOccupancy - b.reservedCapacity) > 0 ORDER BY b.binCode")
    List<BinJpaEntity> findAvailable(@Param("zone") String zone, @Param("tid") String tid);

    @Query("SELECT b FROM BinJpaEntity b WHERE b.tenantId = :tid " +
            "AND (:zone IS NULL OR b.zone = :zone) AND (:type IS NULL OR b.binType = :type) AND (:status IS NULL OR b.status = :status)")
    Page<BinJpaEntity> search(@Param("zone") String zone, @Param("type") BinType type, @Param("status") BinStatus status, @Param("tid") String tid, Pageable p);
}
