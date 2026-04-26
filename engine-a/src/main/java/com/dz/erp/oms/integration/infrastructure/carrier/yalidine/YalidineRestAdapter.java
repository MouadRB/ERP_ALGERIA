package com.dz.erp.oms.integration.infrastructure.carrier.yalidine;

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
 * Yalidine REST adapter. Replace the payload shape with the real Yalidine {@code parcels}
 * contract when wiring live credentials.
 */
@Slf4j
@Component
@ConditionalOnProperty(prefix = "oms.carriers.yalidine", name = "enabled", havingValue = "true")
public class YalidineRestAdapter extends AbstractRestCarrierAdapter {

    public static final String CODE = "YALIDINE";

    private final String apiId;
    private final String apiToken;

    public YalidineRestAdapter(@Qualifier("yalidineRestClient") RestClient rest,
                               @Value("${oms.carriers.yalidine.api-id:}") String apiId,
                               @Value("${oms.carriers.yalidine.api-token:}") String apiToken) {
        super(rest);
        this.apiId = apiId;
        this.apiToken = apiToken;
    }

    @Override
    public String carrierCode() { return CODE; }

    @Override
    public SubmissionResult submit(CarrierShipment shipment) {
        var body = new LinkedHashMap<String, Object>();
        body.put("order_id", shipment.getOrderId().toString());
        body.put("shipment_id", shipment.getShipmentId().toString());

        var headers = Map.of(
                "X-API-ID", apiId,
                "X-API-TOKEN", apiToken
        );
        var resp = postJson("/parcels/", headers, body);

        var tracking = str(resp.get("tracking"));
        var label = str(resp.get("label"));
        if (tracking == null) tracking = "YAL-" + shipment.getShipmentId().toString().substring(0, 8).toUpperCase();
        return new SubmissionResult(tracking, label);
    }

    private static String str(Object o) { return o == null ? null : o.toString(); }
}
