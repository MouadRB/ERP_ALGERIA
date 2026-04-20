package com.dz.erp.oms.integration.infrastructure.carrier.ecotrack;

import com.dz.erp.oms.integration.domain.model.CarrierShipment;
import com.dz.erp.oms.integration.infrastructure.carrier.base.AbstractRestCarrierAdapter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Ecotrack (Noest) REST adapter. Auth: {@code api_token} + {@code user_guid} in body.
 */
@Slf4j
@Component
@ConditionalOnProperty(prefix = "oms.carriers.ecotrack", name = "enabled", havingValue = "true")
public class EcotrackRestAdapter extends AbstractRestCarrierAdapter {

    public static final String CODE = "ECOTRACK";

    private final String apiToken;
    private final String userGuid;

    public EcotrackRestAdapter(@Qualifier("ecotrackRestClient") RestClient rest,
                               @Value("${oms.carriers.ecotrack.api-token:}") String apiToken,
                               @Value("${oms.carriers.ecotrack.user-guid:}") String userGuid) {
        super(rest);
        this.apiToken = apiToken;
        this.userGuid = userGuid;
    }

    @Override
    public String carrierCode() { return CODE; }

    @Override
    public SubmissionResult submit(CarrierShipment shipment) {
        var body = new LinkedHashMap<String, Object>();
        body.put("api_token", apiToken);
        body.put("user_guid", userGuid);
        body.put("reference", shipment.getOrderId().toString());

        var resp = postJson("/create/order", Map.of(), body);

        var tracking = str(resp.get("tracking"));
        if (tracking == null) tracking = "ECO-" + shipment.getShipmentId().toString().substring(0, 8).toUpperCase();
        return new SubmissionResult(tracking, str(resp.get("label_url")));
    }

    private static String str(Object o) { return o == null ? null : o.toString(); }
}
