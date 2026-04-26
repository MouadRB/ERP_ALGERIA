package com.dz.erp.inventory.stock.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StockMovementSpringDataRepository extends JpaRepository<StockMovementJpaEntity, String> {

    @Query("SELECT m.auditHash FROM StockMovementJpaEntity m " +
            "WHERE m.stockRecordId = :srid ORDER BY m.performedAt DESC LIMIT 1")
    Optional<String> findLastHash(@Param("srid") String stockRecordId);

    Page<StockMovementJpaEntity> findByStockRecordIdAndTenantIdOrderByPerformedAtDesc(
            String stockRecordId, String tenantId, Pageable pageable);

    @Query(
            value = "SELECT m FROM StockMovementJpaEntity m " +
                    "WHERE m.tenantId = :tid " +
                    "AND (:type IS NULL OR m.movementType = :type) " +
                    "ORDER BY m.performedAt DESC",
            countQuery = "SELECT COUNT(m) FROM StockMovementJpaEntity m " +
                    "WHERE m.tenantId = :tid " +
                    "AND (:type IS NULL OR m.movementType = :type)"
    )
    Page<StockMovementJpaEntity> findByTenant(@Param("tid") String tenantId,
                                               @Param("type") String type,
                                               Pageable pageable);

    @Query("SELECT COUNT(m) FROM StockMovementJpaEntity m " +
            "WHERE m.tenantId = :tid " +
            "AND CAST(m.performedAt AS date) = CURRENT_DATE " +
            "AND (:inbound = TRUE AND m.movementType IN ('RECEPTION', 'ADJUSTMENT_IN', 'RETURN_APPROVED') " +
            "  OR :inbound = FALSE AND m.movementType IN ('EXPEDITION', 'ADJUSTMENT_OUT', 'RETURN_REJECTED'))")
    int countTodayByDirection(@Param("tid") String tenantId, @Param("inbound") boolean inbound);
}
