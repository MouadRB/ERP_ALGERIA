package com.dz.erp.oms.shared.integration.mdm;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

/**
 * Builds the shared {@link RestClient} used by the MDM adapters. Tight timeouts
 * (default connect 1s / read 2s) keep the intake path responsive — on timeout the
 * adapter throws {@link com.dz.erp.oms.shared.port.MdmUnavailableException} and
 * the order stays in {@code RECEIVED} for later revalidation.
 */
@Configuration
public class MdmRestClientConfig {

    @Bean("omsMdmRestClient")
    public RestClient omsMdmRestClient(
            @Value("${oms.mdm.base-url:http://localhost:8080}") String baseUrl,
            @Value("${oms.mdm.connect-timeout-ms:1000}") long connectMs,
            @Value("${oms.mdm.read-timeout-ms:2000}") long readMs) {
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofMillis(connectMs).toMillis());
        factory.setReadTimeout((int) Duration.ofMillis(readMs).toMillis());
        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }
}
