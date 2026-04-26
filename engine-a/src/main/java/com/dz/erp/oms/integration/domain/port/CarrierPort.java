package com.dz.erp.oms.integration.domain.port;

import com.dz.erp.oms.integration.domain.model.CarrierShipment;

/**
 * Adapter boundary for submitting a shipment to an external carrier. Manual and
 * real carriers both implement this. Each adapter identifies itself via
 * {@link #carrierCode()} — the {@link com.dz.erp.oms.integration.infrastructure.carrier.CarrierRouter}
 * dispatches by that code.
 */
public interface CarrierPort {

    String carrierCode();

    /**
     * Submit the shipment to the carrier. Implementations must be side-effect-free
     * on failure (no partial state change on the carrier side that would require reversal).
     *
     * @throws com.dz.erp.shared.exception.BusinessException with {@code OMS_CARRIER_SUBMIT_FAILED}
     */
    SubmissionResult submit(CarrierShipment shipment);

    record SubmissionResult(String trackingNumber, String labelUrl) {}
}
