package com.dz.erp.oms.shared.port;

/**
 * Outbound port for Catalog channel validation during order intake.
 */
public interface CatalogChannelPort {

    boolean isChannelActive(String tenantId, String channelCode);
}
