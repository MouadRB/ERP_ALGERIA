package com.dz.erp.oms.shared.port;

/**
 * Outbound port for address-validity checks at intake — primarily the Algerian
 * wilaya code (01..58).
 */
public interface MdmAddressPort {

    boolean isWilayaSupported(String tenantId, String wilayaCode);
}
