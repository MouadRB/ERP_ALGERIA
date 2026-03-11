package com.dz.erp.mdm.supplier.infrastructure.persistence;
import com.dz.erp.mdm.supplier.domain.model.SupplierStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
public interface SupplierSpringDataRepository extends JpaRepository<SupplierJpaEntity, String> {
    Optional<SupplierJpaEntity> findBySupplierCodeAndTenantId(String code, String tid);
    boolean existsBySupplierCodeAndTenantId(String code, String tid);
    @Query("SELECT s FROM SupplierJpaEntity s WHERE s.tenantId = :tid " +
            "AND (:search IS NULL OR LOWER(CAST(s.companyName AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "OR LOWER(CAST(s.supplierCode AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
            "AND (:status IS NULL OR s.status = :status) AND (:wilaya IS NULL OR s.wilayaCode = :wilaya)")
    Page<SupplierJpaEntity> search(@Param("search") String search, @Param("status") SupplierStatus status,
                                   @Param("wilaya") String wilaya, @Param("tid") String tid, Pageable p);
}
