package com.dz.erp.pim.logistics.infrastructure.persistence;

import com.dz.erp.pim.logistics.domain.model.ProductLogistics;
import com.dz.erp.pim.logistics.domain.port.LogisticsRepository;
import com.dz.erp.pim.logistics.infrastructure.mapper.LogisticsPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class LogisticsRepositoryAdapter implements LogisticsRepository {

    private final LogisticsSpringDataRepository jpa;
    private final LogisticsPersistenceMapper mapper;

    @Override
    public ProductLogistics save(ProductLogistics logistics) {
        return mapper.toDomain(jpa.save(mapper.toJpa(logistics)));
    }

    @Override
    public Optional<ProductLogistics> findByProductId(String productId, String tenantId) {
        return jpa.findByProductIdAndTenantId(productId, tenantId).map(mapper::toDomain);
    }

    @Override
    public void deleteAllByProductId(String productId, String tenantId) {
        jpa.deleteAllByProductId(productId, tenantId);
    }
}
