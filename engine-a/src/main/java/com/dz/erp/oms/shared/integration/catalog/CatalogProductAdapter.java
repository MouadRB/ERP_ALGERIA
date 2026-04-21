package com.dz.erp.oms.shared.integration.catalog;

import com.dz.erp.catalog.product.domain.port.CatalogProductRepository;
import com.dz.erp.catalog.shared.domain.ChannelType;
import com.dz.erp.catalog.shared.domain.PublicationStatus;
import com.dz.erp.oms.shared.port.CatalogProductPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collection;

/**
 * In-process adapter bridging the OMS {@link CatalogProductPort} to the catalog
 * {@link CatalogProductRepository}. A SKU counts as "published on channel" when:
 * <ul>
 *   <li>it exists for the tenant;</li>
 *   <li>its {@link PublicationStatus} is {@code PUBLISHED}; and</li>
 *   <li>its active-channel set contains the requested {@link ChannelType}.</li>
 * </ul>
 * Any unknown SKU or unknown channel code short-circuits to {@code false}.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CatalogProductAdapter implements CatalogProductPort {

    private final CatalogProductRepository catalogRepo;

    @Override
    public boolean areAllPublishedOnChannel(String tenantId, String channelCode, Collection<String> skuCodes) {
        if (skuCodes == null || skuCodes.isEmpty()) {
            return false;
        }
        ChannelType channel;
        try {
            channel = ChannelType.valueOf(channelCode);
        } catch (IllegalArgumentException ex) {
            log.debug("Unknown channelCode '{}' for tenant {}", channelCode, tenantId);
            return false;
        }
        for (var sku : skuCodes) {
            var product = catalogRepo.findBySkuCodeAndTenantId(sku, tenantId).orElse(null);
            if (product == null) {
                log.debug("SKU {} not in catalog for tenant {}", sku, tenantId);
                return false;
            }
            if (product.getStatus() != PublicationStatus.PUBLISHED) {
                log.debug("SKU {} status {} != PUBLISHED for tenant {}", sku, product.getStatus(), tenantId);
                return false;
            }
            if (!product.getActiveChannels().contains(channel)) {
                log.debug("SKU {} not active on channel {} for tenant {}", sku, channel, tenantId);
                return false;
            }
        }
        return true;
    }
}
