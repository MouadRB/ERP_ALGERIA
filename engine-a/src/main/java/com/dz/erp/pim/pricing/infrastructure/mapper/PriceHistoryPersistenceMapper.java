package com.dz.erp.pim.pricing.infrastructure.mapper;

import com.dz.erp.pim.pricing.domain.model.PriceHistory;
import com.dz.erp.pim.pricing.infrastructure.persistence.PriceHistoryJpaEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PriceHistoryPersistenceMapper {
    PriceHistoryJpaEntity toJpa(PriceHistory h);
}
