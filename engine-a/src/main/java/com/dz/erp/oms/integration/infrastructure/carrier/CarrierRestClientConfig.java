package com.dz.erp.oms.integration.infrastructure.carrier;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

/**
 * Stage 9 — builds one {@link RestClient} bean per real carrier. Each client has its
 * own base URL and socket timeouts, pulled from {@code oms.carriers.{code}.*} config.
 * The bean only exists when the matching carrier has {@code enabled=true}, which
 * lines up with the carrier adapter/verifier beans — all turn on or off together.
 */
@Configuration
public class CarrierRestClientConfig {

    private static RestClient build(String baseUrl, long connectMs, long readMs) {
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) connectMs);
        factory.setReadTimeout((int) readMs);
        return RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
    }

    @Bean("yalidineRestClient")
    @ConditionalOnProperty(prefix = "oms.carriers.yalidine", name = "enabled", havingValue = "true")
    public RestClient yalidineRestClient(
            @Value("${oms.carriers.yalidine.base-url}") String baseUrl,
            @Value("${oms.carriers.yalidine.connect-timeout-ms:2000}") long connectMs,
            @Value("${oms.carriers.yalidine.read-timeout-ms:5000}") long readMs) {
        return build(baseUrl, connectMs, readMs);
    }

    @Bean("zrExpressRestClient")
    @ConditionalOnProperty(prefix = "oms.carriers.zrexpress", name = "enabled", havingValue = "true")
    public RestClient zrExpressRestClient(
            @Value("${oms.carriers.zrexpress.base-url}") String baseUrl,
            @Value("${oms.carriers.zrexpress.connect-timeout-ms:2000}") long connectMs,
            @Value("${oms.carriers.zrexpress.read-timeout-ms:5000}") long readMs) {
        return build(baseUrl, connectMs, readMs);
    }

    @Bean("ecotrackRestClient")
    @ConditionalOnProperty(prefix = "oms.carriers.ecotrack", name = "enabled", havingValue = "true")
    public RestClient ecotrackRestClient(
            @Value("${oms.carriers.ecotrack.base-url}") String baseUrl,
            @Value("${oms.carriers.ecotrack.connect-timeout-ms:2000}") long connectMs,
            @Value("${oms.carriers.ecotrack.read-timeout-ms:5000}") long readMs) {
        return build(baseUrl, connectMs, readMs);
    }

    @Bean("maystroRestClient")
    @ConditionalOnProperty(prefix = "oms.carriers.maystro", name = "enabled", havingValue = "true")
    public RestClient maystroRestClient(
            @Value("${oms.carriers.maystro.base-url}") String baseUrl,
            @Value("${oms.carriers.maystro.connect-timeout-ms:2000}") long connectMs,
            @Value("${oms.carriers.maystro.read-timeout-ms:5000}") long readMs) {
        return build(baseUrl, connectMs, readMs);
    }
}
