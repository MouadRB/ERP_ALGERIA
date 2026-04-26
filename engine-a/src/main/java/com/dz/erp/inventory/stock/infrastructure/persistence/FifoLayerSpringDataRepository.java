package com.dz.erp.inventory.stock.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FifoLayerSpringDataRepository extends JpaRepository<FifoLayerJpaEntity, String> {

    @Query("SELECT f FROM FifoLayerJpaEntity f " +
            "WHERE f.stockRecordId = :srid AND f.status = 'ACTIVE' " +
            "ORDER BY f.layerNumber ASC")
    List<FifoLayerJpaEntity> findActiveOrderedByLayerNumber(@Param("srid") String stockRecordId);

    List<FifoLayerJpaEntity> findAllByStockRecordIdOrderByLayerNumberAsc(String stockRecordId);

    @Query("SELECT COALESCE(MAX(f.layerNumber), 0) + 1 FROM FifoLayerJpaEntity f " +
            "WHERE f.stockRecordId = :srid")
    int nextLayerNumber(@Param("srid") String stockRecordId);
}
