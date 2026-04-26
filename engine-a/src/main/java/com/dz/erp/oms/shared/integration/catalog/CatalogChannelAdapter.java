package com.dz.erp.oms.shared.integration.catalog;

import com.dz.erp.catalog.channel.domain.port.SalesChannelRepository;
import com.dz.erp.catalog.shared.domain.ChannelType;
import com.dz.erp.oms.shared.port.CatalogChannelPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * In-process adapter bridging the OMS {@link CatalogChannelPort} to the existing
 * Catalog {@link SalesChannelRepository}. {@code channelCode} is the upper-case
 * name of {@link ChannelType} (e.g. {@code "WEB"}, {@code "WHATSAPP"}).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CatalogChannelAdapter implements CatalogChannelPort {

    private final SalesChannelRepository salesChannelRepository;

    @Override
    public boolean isChannelActive(String tenantId, String channelCode) {
        ChannelType type;
        try {
            type = ChannelType.valueOf(channelCode);
        } catch (IllegalArgumentException ex) {
            log.debug("Unknown channelCode '{}' for tenant {}", channelCode, tenantId);
            return false;
        }
        return salesChannelRepository.findByChannelTypeAndTenantId(type, tenantId)
                .map(ch -> ch.isActive())
                .orElse(false);
    }
}
