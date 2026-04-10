package com.dz.erp.pim.attribute.infrastructure.persistence;
import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface ProductAttributeSpringDataRepository extends JpaRepository<ProductAttributeJpaEntity, String> {
    List<ProductAttributeJpaEntity> findByProductId(String productId);
    void deleteAllByProductId(String productId, String tenantId);

}
