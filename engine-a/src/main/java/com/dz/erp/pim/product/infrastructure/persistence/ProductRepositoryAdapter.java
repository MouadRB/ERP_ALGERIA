package com.dz.erp.pim.product.infrastructure.persistence;

import com.dz.erp.pim.product.domain.model.*;
import com.dz.erp.pim.product.domain.port.ProductRepository;
import com.dz.erp.pim.product.infrastructure.mapper.ProductPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ProductRepositoryAdapter implements ProductRepository {
    private final ProductSpringDataRepository jpa;
    private final ProductPersistenceMapper m;

    @Override
    public Product save(Product p) {
        return m.toDomain(jpa.save(m.toJpa(p)));
    }

    @Override
    public Optional<Product> findById(String id, String tid) {
        return jpa.findByProductIdAndTenantId(id, tid).map(m::toDomain);
    }

    @Override
    public Optional<Product> findBySkuCode(String sku, String tid) {
        return jpa.findBySkuCodeAndTenantId(sku, tid).map(m::toDomain);
    }

    @Override
    public boolean existsBySkuCode(String sku, String tid) {
        return jpa.existsBySkuCodeAndTenantId(sku, tid);
    }

    @Override
    public Page<Product> search(String s, String cat, ProductStatus st, String sup, String tid, Pageable p) {
        return jpa.search(s, cat, st != null ? st.name() : null, sup, tid, p).map(m::toDomain);
    }

    @Override
    public long countByStatus(ProductStatus st, String tid) {
        return jpa.countByStatusAndTenantId(st, tid);
    }

    @Override
    public long countByReturnRateGreaterThan(BigDecimal t, String tid) {
        return jpa.countHighReturnRate(t, tid);
    }

    @Override
    public void deleteByProductIdAndTenantId(String productId, String tenantId) {
        jpa.deleteByProductIdAndTenantId(productId, tenantId);
    }



}
