package com.dz.erp.mdm.wilaya.infrastructure.persistence;
import com.dz.erp.mdm.wilaya.domain.model.WilayaStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
public interface WilayaSpringDataRepository extends JpaRepository<WilayaJpaEntity, String> {
    Optional<WilayaJpaEntity> findByWilayaCodeAndTenantId(String code, String tid);
    boolean existsByWilayaCodeAndTenantId(String code, String tid);
    @Query("SELECT w FROM WilayaJpaEntity w WHERE w.tenantId = :tid AND w.status = 'ACTIVE' AND w.deliverable = true ORDER BY w.wilayaCode")
    List<WilayaJpaEntity> findDeliverable(@Param("tid") String tid);
    @Query("SELECT w FROM WilayaJpaEntity w WHERE w.tenantId = :tid " +
           "AND (:zone IS NULL OR w.zone = :zone) AND (:del IS NULL OR w.deliverable = :del) AND (:status IS NULL OR w.status = :status)")
    Page<WilayaJpaEntity> search(@Param("zone") String zone, @Param("del") Boolean del, @Param("status") WilayaStatus status, @Param("tid") String tid, Pageable p);
}
