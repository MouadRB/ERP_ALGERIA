package com.dz.erp.pim.logistics.domain.port;

import com.dz.erp.pim.logistics.domain.model.ProductLogistics;

import java.util.Optional;

public interface LogisticsRepository {
    ProductLogistics save(ProductLogistics logistics);
    Optional<ProductLogistics> findByProductId(String productId, String tenantId);
    void deleteAllByProductId(String productId, String tenantId);

}
