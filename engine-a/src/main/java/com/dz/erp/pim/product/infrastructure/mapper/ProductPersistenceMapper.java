package com.dz.erp.pim.product.infrastructure.mapper;

import com.dz.erp.pim.product.domain.model.Product;
import com.dz.erp.pim.product.infrastructure.persistence.ProductJpaEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProductPersistenceMapper {
    ProductJpaEntity toJpa(Product p);

    default Product toDomain(ProductJpaEntity e) {
        if (e == null) return null;
        return Product.reconstitute(e.getProductId(), e.getTenantId(), e.getSkuCode(), e.getSkuStatus(),
                e.getSupplierCode(), e.getSupplierRef(), e.getCategoryCode(),
                e.getNameFr(), e.getNameAr(), e.getDescriptionFr(), e.getDescriptionAr(),
                e.getBrand(), e.getModel(), e.getOrigin(), e.getBarcode(),
                e.getVariantCount(), e.getTotalStock(), e.getStatus(), e.getReturnPolicy(),
                e.getReturnRate(), e.getOrdersLast30Days(), e.getSalesLast30Days(), e.getQualityScore(),
                e.getCreatedBy(), e.getCreatedAt(), e.getUpdatedBy(), e.getUpdatedAt(), e.getVersion());
    }
}
