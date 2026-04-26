package com.dz.erp.catalog.channel.infrastructure.mapper;

import com.dz.erp.catalog.channel.domain.model.SalesChannel;
import com.dz.erp.catalog.channel.domain.model.SalesChannelRules;
import com.dz.erp.catalog.channel.infrastructure.persistence.SalesChannelJpaEntity;
import org.springframework.stereotype.Component;

/**
 * Maps between SalesChannel domain model and JPA entity.
 * Rules are flattened into JPA columns and reconstituted as a value object.
 */
@Component
public class SalesChannelPersistenceMapper {

    public SalesChannel toDomain(SalesChannelJpaEntity e) {
        if (e == null) return null;

        var rules = new SalesChannelRules(
                e.isAutoMaskOnZeroStock(), e.isAutoRepublishOnStock(),
                e.isExcludeZeroPrice(), e.isExcludeNegativeStock(),
                e.isExcludeOcrDraft(), e.isExcludeVariantsIndividual(),
                e.getMinPriceDzd(), e.getMaxPriceDzd()
        );

        return SalesChannel.reconstitute(
                e.getId(), e.getTenantId(), e.getChannelType(), e.isActive(), rules,
                e.getSyncFrequencyMinutes(), e.getWelcomeMessageFr(), e.getWelcomeMessageAr(),
                e.getCatalogId(), e.getOpensearchIndex(), e.getLastSyncAt(),
                e.getLastSyncProductCount(), e.getLastSyncErrorCount(),
                e.getCreatedAt(), e.getUpdatedAt(), e.getVersion()
        );
    }

    public SalesChannelJpaEntity toJpa(SalesChannel d) {
        var e = new SalesChannelJpaEntity();
        e.setId(d.getId());
        e.setTenantId(d.getTenantId());
        e.setChannelType(d.getChannelType());
        e.setActive(d.isActive());

        var r = d.getRules();
        e.setAutoMaskOnZeroStock(r.autoMaskOnZeroStock());
        e.setAutoRepublishOnStock(r.autoRepublishOnStock());
        e.setExcludeZeroPrice(r.excludeZeroPrice());
        e.setExcludeNegativeStock(r.excludeNegativeStock());
        e.setExcludeOcrDraft(r.excludeOcrDraft());
        e.setExcludeVariantsIndividual(r.excludeVariantsIndividual());
        e.setMinPriceDzd(r.minPriceDzd());
        e.setMaxPriceDzd(r.maxPriceDzd());

        e.setSyncFrequencyMinutes(d.getSyncFrequencyMinutes());
        e.setWelcomeMessageFr(d.getWelcomeMessageFr());
        e.setWelcomeMessageAr(d.getWelcomeMessageAr());
        e.setCatalogId(d.getCatalogId());
        e.setOpensearchIndex(d.getOpensearchIndex());
        e.setLastSyncAt(d.getLastSyncAt());
        e.setLastSyncProductCount(d.getLastSyncProductCount());
        e.setLastSyncErrorCount(d.getLastSyncErrorCount());
        e.setCreatedAt(d.getCreatedAt());
        e.setUpdatedAt(d.getUpdatedAt());
        e.setVersion(d.getVersion());

        return e;
    }
}
