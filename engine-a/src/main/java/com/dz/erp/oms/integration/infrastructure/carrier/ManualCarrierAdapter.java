package com.dz.erp.oms.integration.infrastructure.carrier;

import com.dz.erp.oms.integration.domain.model.CarrierShipment;
import com.dz.erp.oms.integration.domain.port.CarrierPort;
import org.springframework.stereotype.Component;

/**
 * Fallback carrier used when no real carrier is configured or a tenant opts for manual
 * operations. Produces a synthetic tracking number so the submission flow completes and
 * operators can drive the shipment manually through the operator API.
 */
@Component
public class ManualCarrierAdapter implements CarrierPort {

    public static final String CODE = "MANUAL";

    @Override
    public String carrierCode() { return CODE; }

    @Override
    public SubmissionResult submit(CarrierShipment shipment) {
        var tracking = "MANUAL-" + shipment.getShipmentId().toString().substring(0, 8).toUpperCase();
        return new SubmissionResult(tracking, null);
    }
}
