package com.dz.erp.oms.integration.infrastructure.carrier.maystro;

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
 * Maystro REST adapter. Auth: {@code Authorization: Token {api-key}}.
 */
@Slf4j
@Component
@ConditionalOnProperty(prefix = "oms.carriers.maystro", name = "enabled", havingValue = "true")
public class MaystroRestAdapter extends AbstractRestCarrierAdapter {

    public static final String CODE = "MAYSTRO";

    private final String apiKey;

    public MaystroRestAdapter(@Qualifier("maystroRestClient") RestClient rest,
                              @Value("${oms.carriers.maystro.api-key:}") String apiKey) {
        super(rest);
        this.apiKey = apiKey;
    }

    @Override
    public String carrierCode() { return CODE; }

    @Override
    public SubmissionResult submit(CarrierShipment shipment) {
        var body = new LinkedHashMap<String, Object>();
        body.put("external_order_id", shipment.getOrderId().toString());
        body.put("shipment_id", shipment.getShipmentId().toString());

        var headers = Map.of("Authorization", "Token " + apiKey);
        var resp = postJson("/orders/", headers, body);

        var tracking = str(resp.get("display_id"));
        if (tracking == null) tracking = str(resp.get("tracking"));
        if (tracking == null) tracking = "MYS-" + shipment.getShipmentId().toString().substring(0, 8).toUpperCase();
        return new SubmissionResult(tracking, str(resp.get("label")));
    }

    private static String str(Object o) { return o == null ? null : o.toString(); }
}
