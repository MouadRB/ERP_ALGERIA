package com.dz.erp.pim.ocr.infrastructure.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class OcrRestClientConfig {

    @Bean("ocrRestClient")
    public RestClient ocrRestClient(
            @Value("${app.ocr.base-url:http://localhost:8085}") String baseUrl,
            @Value("${app.ocr.connect-timeout-ms:3000}") long connectMs,
            @Value("${app.ocr.read-timeout-ms:60000}") long readMs) {
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofMillis(connectMs).toMillis());
        factory.setReadTimeout((int) Duration.ofMillis(readMs).toMillis());
        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }
}
