package com.dz.erp.oms.shared.integration.mdm;

import com.dz.erp.oms.shared.port.MdmAddressPort;
import com.dz.erp.oms.shared.port.MdmUnavailableException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * REST adapter for MDM wilaya/coverage lookup. 200 with {@code deliverable:true}
 * → supported; 404 → not supported; transient failures → {@link MdmUnavailableException}.
 * Plain RestClient, no cross-cutting annotations.
 */
@Slf4j
@Component
@ConditionalOnProperty(prefix = "oms.mdm", name = "mode", havingValue = "rest")
public class MdmAddressRestAdapter implements MdmAddressPort {

    private final RestClient rest;

    public MdmAddressRestAdapter(@Qualifier("omsMdmRestClient") RestClient rest) {
        this.rest = rest;
    }

    @Override
    public boolean isWilayaSupported(String tenantId, String wilayaCode) {
        if (wilayaCode == null || wilayaCode.length() != 2) return false;
        try {
            var r = rest.get()
                    .uri("/mdm/v1/wilayas/{code}", wilayaCode)
                    .header("X-Tenant-Id", tenantId)
                    .header("Authorization", authHeader())
                    .retrieve()
                    .body(Map.class);
            if (r == null || r.get("data") == null) return false;
            var data = (Map<?, ?>) r.get("data");
            return Boolean.TRUE.equals(data.get("deliverable"));
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) return false;
            log.warn("MDM wilaya lookup returned {} for {}: {}",
                    e.getStatusCode(), wilayaCode, e.getMessage());
            return false;
        } catch (HttpServerErrorException | ResourceAccessException e) {
            throw new MdmUnavailableException(
                    "MDM unreachable while validating wilaya " + wilayaCode, e);
        }
    }

    private String authHeader() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getCredentials() != null
                ? "Bearer " + auth.getCredentials()
                : "";
    }
}
