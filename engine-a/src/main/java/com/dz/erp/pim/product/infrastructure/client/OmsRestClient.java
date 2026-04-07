package com.dz.erp.pim.product.infrastructure.client;

import com.dz.erp.pim.product.domain.port.OmsClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.*;

@Slf4j
@Component
public class OmsRestClient implements OmsClient {
    private final RestClient rest;

    public OmsRestClient(@Value("${app.oms.base-url:http://localhost:8082/api}") String baseUrl) {
        this.rest = RestClient.builder().baseUrl(baseUrl).build();
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<ReturnRateDto> getAllReturnRates(String tenantId) {
        try {
            var r = rest.get().uri("/oms/v1/products/return-rates?tenantId={tid}", tenantId)
                    .retrieve().body(Map.class);
            if (r == null || r.get("data") == null) return List.of();
            return ((List<Map<String, Object>>) r.get("data")).stream()
                    .map(d -> new ReturnRateDto((String) d.get("skuCode"), new BigDecimal(d.get("returnRate").toString())))
                    .toList();
        } catch (Exception ex) {
            log.warn("OMS return rate fetch failed: {}", ex.getMessage());
            return List.of();
        }
    }
}
