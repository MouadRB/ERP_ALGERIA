package com.dz.erp.catalog.search.infrastructure.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.apache.hc.client5.http.impl.nio.PoolingAsyncClientConnectionManagerBuilder;
import org.apache.hc.core5.http.HttpHost;
import org.opensearch.client.json.jackson.JacksonJsonpMapper;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.transport.httpclient5.ApacheHttpClient5TransportBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenSearch client configuration.
 *
 * Uses opensearch-java 2.x client (NOT the deprecated RestHighLevelClient).
 * Index name follows the pattern: {prefix}_{tenantId}
 */
@Configuration
public class OpenSearchConfig {

    @Value("${catalog.opensearch.host:localhost}")
    private String host;

    @Value("${catalog.opensearch.port:9200}")
    private int port;

    @Value("${catalog.opensearch.scheme:http}")
    private String scheme;

    @Value("${catalog.opensearch.index-prefix:ferza_products}")
    private String indexPrefix;

    @Bean
    public OpenSearchClient openSearchClient() {
        var httpHost = new HttpHost(scheme, host, port);

        var objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        var transport = ApacheHttpClient5TransportBuilder
                .builder(httpHost)
                .setMapper(new JacksonJsonpMapper(objectMapper))
                .build();

        return new OpenSearchClient(transport);
    }

    @Bean
    public String openSearchIndexPrefix() {
        return indexPrefix;
    }
}
