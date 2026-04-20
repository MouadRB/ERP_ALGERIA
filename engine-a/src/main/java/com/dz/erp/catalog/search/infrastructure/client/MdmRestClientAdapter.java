package com.dz.erp.catalog.search.infrastructure.client;

import com.dz.erp.catalog.search.shared.port.MdmDataPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * MdmDataPort implementation that calls MDM REST endpoints.
 * Calls GET /mdm/v1/wilayas/deliverable to fetch deliverable wilaya codes.
 */
@Slf4j
@Component
public class MdmRestClientAdapter implements MdmDataPort {

    private final RestClient rest;

    public MdmRestClientAdapter(@Value("${app.mdm.base-url:http://localhost:8081}") String baseUrl) {
        this.rest = RestClient.builder().baseUrl(baseUrl).build();
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<String> getDeliverableWilayaCodes(String token) {
        try {
            var result = rest.get()
                    .uri("/mdm/v1/wilayas/deliverable")
                    .header("Authorization", "Bearer " + token)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (result == null || result.get("data") == null) return List.of();

            return ((List<Map<String, Object>>) result.get("data")).stream()
                    .map(d -> (String) d.get("wilayaCode"))
                    .toList();
        } catch (Exception ex) {
            log.warn("MDM deliverable wilayas fetch failed: {}", ex.getMessage());
            return List.of();
        }
    }
}
