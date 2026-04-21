package com.dz.erp.inventory.stock.infrastructure.persistence;

import com.dz.erp.inventory.stock.domain.model.StockStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface StockRecordSpringDataRepository extends JpaRepository<StockRecordJpaEntity, String> {

    Optional<StockRecordJpaEntity> findByStockRecordIdAndTenantId(String stockRecordId, String tenantId);

    Optional<StockRecordJpaEntity> findBySkuCodeAndTenantId(String skuCode, String tenantId);

    boolean existsBySkuCodeAndTenantId(String skuCode, String tenantId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM StockRecordJpaEntity s WHERE s.stockRecordId = :id AND s.tenantId = :tid")
    Optional<StockRecordJpaEntity> findByIdForUpdate(@Param("id") String id, @Param("tid") String tid);

    List<StockRecordJpaEntity> findAllBySkuCodeAndTenantId(String skuCode, String tenantId);

    @Query(
            value = "SELECT s FROM StockRecordJpaEntity s " +
                    "WHERE s.tenantId = :tid " +
                    "AND (:search IS NULL OR s.skuCode ILIKE %:search%) " +
                    "AND (:status IS NULL OR s.status = :status)",
            countQuery = "SELECT COUNT(s) FROM StockRecordJpaEntity s " +
                    "WHERE s.tenantId = :tid " +
                    "AND (:search IS NULL OR s.skuCode ILIKE %:search%) " +
                    "AND (:status IS NULL OR s.status = :status)"
    )
    Page<StockRecordJpaEntity> search(@Param("search") String search,
                                      @Param("status") StockStatus status,
                                      @Param("tid") String tenantId,
                                      Pageable pageable);

    long countByStatusAndTenantId(StockStatus status, String tenantId);

    @Query("SELECT COALESCE(SUM(s.fifoValuation), 0) FROM StockRecordJpaEntity s WHERE s.tenantId = :tid")
    BigDecimal sumFifoValuation(@Param("tid") String tenantId);

    @Query("SELECT COALESCE(SUM(s.softReserved), 0) FROM StockRecordJpaEntity s WHERE s.tenantId = :tid")
    int sumSoftReserved(@Param("tid") String tenantId);

    @Query("SELECT COALESCE(SUM(s.hardReserved), 0) FROM StockRecordJpaEntity s WHERE s.tenantId = :tid")
    int sumHardReserved(@Param("tid") String tenantId);

    @Query("SELECT COALESCE(SUM(s.totalQuantity), 0) FROM StockRecordJpaEntity s " +
            "WHERE s.skuCode = :sku AND s.tenantId = :tid")
    int sumTotalQuantityBySkuCode(@Param("sku") String skuCode, @Param("tid") String tenantId);

    long countByTenantId(String tenantId);
}
