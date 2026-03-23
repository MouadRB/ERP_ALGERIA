package com.dz.erp.pim.pricing.infrastructure.mapper;

import com.dz.erp.pim.pricing.domain.model.ProductPrice;
import com.dz.erp.pim.pricing.infrastructure.persistence.ProductPriceJpaEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PricePersistenceMapper {
    ProductPriceJpaEntity toJpa(ProductPrice p);

    default ProductPrice toDomain(ProductPriceJpaEntity e) {
        if (e == null) return null;
        return ProductPrice.reconstitute(e.getProductId(), e.getTenantId(), e.getPriceTtc(), e.getPriceHt(),
                e.getTaxRate(), e.getTvaAmount(), e.getTaxRuleCode(), e.getCostFifo(), e.getCostWeightedAvg(),
                e.getLastPurchaseOrderRef(), e.getMarginAmount(), e.getMarginPercent(), e.getUpdatedBy(), e.getUpdatedAt(), e.getVersion());
    }
}
