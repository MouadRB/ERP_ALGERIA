package com.dz.erp.pim.product.domain.port;

import com.dz.erp.pim.product.domain.model.Product;
import com.dz.erp.pim.product.domain.model.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Optional;

public interface ProductRepository {
    Product save(Product product);

    Optional<Product> findById(String productId, String tenantId);

    Optional<Product> findBySkuCode(String skuCode, String tenantId);

    boolean existsBySkuCode(String skuCode, String tenantId);

    Page<Product> search(String search, String categoryCode, ProductStatus status,
                         String supplierCode, String tenantId, Pageable pageable);

    long countByStatus(ProductStatus status, String tenantId);

    long countByReturnRateGreaterThan(BigDecimal threshold, String tenantId);

    void deleteByProductIdAndTenantId(String productId, String tenantId);

}
