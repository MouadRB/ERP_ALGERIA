package com.dz.erp.oms.shared.port;

import java.util.Collection;

/**
 * Outbound port verifying that every submitted SKU is published on the given channel.
 */
public interface CatalogProductPort {

    boolean areAllPublishedOnChannel(String tenantId, String channelCode, Collection<String> skuCodes);
}
