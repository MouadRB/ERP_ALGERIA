package com.dz.erp.inventory.alert.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StockAlertSpringDataRepository extends JpaRepository<StockAlertJpaEntity, String> {

    Optional<StockAlertJpaEntity> findByAlertIdAndTenantId(String alertId, String tenantId);

    @Query("SELECT a FROM StockAlertJpaEntity a WHERE a.tenantId = :tid AND a.active = true ORDER BY a.triggeredAt DESC")
    List<StockAlertJpaEntity> findActive(@Param("tid") String tenantId);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM StockAlertJpaEntity a " +
            "WHERE a.stockRecordId = :srid AND a.alertType = :type AND a.active = true")
    boolean existsActiveByStockRecordIdAndType(@Param("srid") String stockRecordId,
                                                @Param("type") String type);
}
