package com.dz.erp.pim.product.infrastructure.persistence;

import com.dz.erp.pim.product.domain.model.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface ProductSpringDataRepository extends JpaRepository<ProductJpaEntity, String> {
    Optional<ProductJpaEntity> findByProductIdAndTenantId(String productId, String tenantId);

    Optional<ProductJpaEntity> findBySkuCodeAndTenantId(String skuCode, String tenantId);

    boolean existsBySkuCodeAndTenantId(String skuCode, String tenantId);

    @Query(
            value = "SELECT p FROM ProductJpaEntity p " +
                    "WHERE p.tenantId = :tid " +
                    "AND (:search IS NULL OR p.nameFr ILIKE %:search% " +
                    "     OR p.nameAr ILIKE %:search% " +
                    "     OR p.skuCode ILIKE %:search% " +
                    "     OR p.barcode ILIKE %:search%) " +
                    "AND (:cat IS NULL OR p.categoryCode = :cat) " +
                    "AND (:status IS NULL OR p.status = :status) " +
                    "AND (:supplier IS NULL OR p.supplierCode = :supplier)",
            countQuery = "SELECT COUNT(p) FROM ProductJpaEntity p " +
                    "WHERE p.tenantId = :tid " +
                    "AND (:search IS NULL OR p.nameFr ILIKE %:search% " +
                    "     OR p.nameAr ILIKE %:search% " +
                    "     OR p.skuCode ILIKE %:search% " +
                    "     OR p.barcode ILIKE %:search%) " +
                    "AND (:cat IS NULL OR p.categoryCode = :cat) " +
                    "AND (:status IS NULL OR p.status = :status) " +
                    "AND (:supplier IS NULL OR p.supplierCode = :supplier)"
    )
    Page<ProductJpaEntity> search(@Param("search") String s, @Param("cat") String cat,
                                  @Param("status") String st, @Param("supplier") String sup,
                                  @Param("tid") String tid, Pageable p);

    long countByStatusAndTenantId(ProductStatus status, String tenantId);

    @Query("SELECT COUNT(p) FROM ProductJpaEntity p WHERE p.tenantId = :tid AND p.returnRate > :t")
    long countHighReturnRate(@Param("t") BigDecimal t, @Param("tid") String tid);
    void deleteByProductIdAndTenantId(String productId, String tenantId);

}
