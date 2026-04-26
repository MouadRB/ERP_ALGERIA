package com.dz.erp.oms.integration.infrastructure.carrier.base;

import com.dz.erp.oms.integration.domain.port.CarrierPort;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Shared skeleton for every real carrier REST adapter. Concrete subclasses provide
 * {@link #carrierCode()}, the HTTP path, and the request/response mapping.
 *
 * <p>Transport errors are translated to {@link com.dz.erp.shared.exception.BusinessException}
 * with {@code OMS_CARRIER_SUBMIT_FAILED} (4xx) or {@code OMS_CARRIER_UNAVAILABLE} (5xx /
 * network). The calling {@code ShipmentSubmissionService} records the failure on the
 * {@code CarrierShipment} aggregate — retries, if any, come from the shared outbox poller.
 */
@Slf4j
public abstract class AbstractRestCarrierAdapter implements CarrierPort {

    protected final RestClient rest;

    protected AbstractRestCarrierAdapter(RestClient rest) {
        this.rest = rest;
    }

    @SuppressWarnings("rawtypes")
    protected Map postJson(String path, Map<String, String> headers, Object body) {
        try {
            var spec = rest.post().uri(path).contentType(org.springframework.http.MediaType.APPLICATION_JSON);
            if (headers != null) headers.forEach(spec::header);
            var resp = spec.body(body).retrieve().body(Map.class);
            return resp == null ? Map.of() : resp;
        } catch (HttpClientErrorException e) {
            log.warn("Carrier {} rejected submit ({}): {}", carrierCode(), e.getStatusCode(), e.getMessage());
            throw new BusinessException(ErrorCode.OMS_CARRIER_SUBMIT_FAILED, carrierCode());
        } catch (HttpServerErrorException | ResourceAccessException e) {
            log.warn("Carrier {} unavailable: {}", carrierCode(), e.getMessage());
            throw new BusinessException(ErrorCode.OMS_CARRIER_UNAVAILABLE, carrierCode());
        }
    }
}
