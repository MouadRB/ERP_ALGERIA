package com.dz.erp.catalog.product.infrastructure.mapper;

import com.dz.erp.catalog.product.domain.model.CatalogProduct;
import com.dz.erp.catalog.product.infrastructure.persistence.CatalogProductJpaEntity;
import com.dz.erp.catalog.shared.domain.ChannelType;
import com.dz.erp.catalog.shared.domain.VisibilityRule;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Set;

@Component
public class CatalogProductPersistenceMapper {

    public CatalogProductJpaEntity toJpa(CatalogProduct d) {
        var e = new CatalogProductJpaEntity();
        e.setId(d.getId());
        e.setTenantId(d.getTenantId());
        e.setSkuCode(d.getSkuCode());
        e.setCategoryId(d.getCategoryId());
        e.setPublicationStatus(d.getStatus());
        e.setScheduledAt(d.getScheduledAt());
        e.setAutoUnpublishAt(d.getAutoUnpublishAt());
        e.setChannelWeb(d.getActiveChannels().contains(ChannelType.WEB));
        e.setChannelWhatsapp(d.getActiveChannels().contains(ChannelType.WHATSAPP));
        e.setChannelMarketplace(d.getActiveChannels().contains(ChannelType.MARKETPLACE));
        e.setVisibilityScore(d.getVisibilityScore());
        e.setMaskedReason(d.getMaskedReason());
        e.setFeaturedHomepage(d.isFeaturedHomepage());
        e.setBadgeStockLimit(d.isBadgeStockLimit());
        e.setStockLimitThreshold(d.getStockLimitThreshold());
        e.setIncludeInSponsoredSearch(d.isIncludeInSponsoredSearch());
        e.setCreatedAt(d.getCreatedAt());
        e.setUpdatedAt(d.getUpdatedAt());
        e.setActiveRulesJson(rulesToJson(d.getActiveRules()));
        return e;
    }

    public CatalogProduct toDomain(CatalogProductJpaEntity e) {
        if (e == null) return null;

        var channels = EnumSet.noneOf(ChannelType.class);
        if (e.isChannelWeb()) channels.add(ChannelType.WEB);
        if (e.isChannelWhatsapp()) channels.add(ChannelType.WHATSAPP);
        if (e.isChannelMarketplace()) channels.add(ChannelType.MARKETPLACE);

        Set<VisibilityRule> rules = jsonToRules(e.getActiveRulesJson());

        return CatalogProduct.reconstitute(
                e.getId(), e.getTenantId(), e.getSkuCode(), e.getCategoryId(),
                e.getPublicationStatus(), e.getMaskedReason(),
                channels, rules,
                e.getScheduledAt(), e.getAutoUnpublishAt(),
                e.isFeaturedHomepage(), e.isBadgeStockLimit(), e.getStockLimitThreshold(),
                e.isIncludeInSponsoredSearch(), e.getVisibilityScore(),
                e.getCreatedAt(), e.getUpdatedAt());
    }

    private String rulesToJson(Set<VisibilityRule> rules) {
        if (rules == null || rules.isEmpty()) return null;
        return rules.stream()
                .map(Enum::name)
                .sorted()
                .reduce((a, b) -> a + "," + b)
                .orElse(null);
    }

    private Set<VisibilityRule> jsonToRules(String json) {
        if (json == null || json.isBlank()) return EnumSet.noneOf(VisibilityRule.class);
        var rules = EnumSet.noneOf(VisibilityRule.class);
        for (var name : json.split(",")) {
            try {
                rules.add(VisibilityRule.valueOf(name.trim()));
            } catch (IllegalArgumentException ignored) {
                // skip unknown rules
            }
        }
        return rules;
    }
}
