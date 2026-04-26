package com.dz.erp.oms.order.infrastructure.search;

import org.apache.hc.client5.http.auth.AuthScope;
import org.apache.hc.client5.http.auth.UsernamePasswordCredentials;
import org.apache.hc.client5.http.impl.auth.BasicCredentialsProvider;
import org.apache.hc.core5.http.HttpHost;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.transport.httpclient5.ApacheHttpClient5TransportBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Stage 11 — builds the {@link OpenSearchClient} used by the order read-model
 * adapter. The bean is only registered when {@code oms.search.enabled=true} —
 * search listeners and the search endpoint all check {@code @ConditionalOnBean} so
 * the feature compiles and boots even without an OpenSearch cluster reachable.
 */
@Configuration
@ConditionalOnProperty(prefix = "oms.search", name = "enabled", havingValue = "true")
public class OpenSearchConfig {

    @Bean
    public OpenSearchClient omsOpenSearchClient(
            @Value("${oms.search.opensearch.host:localhost}") String host,
            @Value("${oms.search.opensearch.port:9200}") int port,
            @Value("${oms.search.opensearch.scheme:http}") String scheme,
            @Value("${oms.search.opensearch.username:}") String username,
            @Value("${oms.search.opensearch.password:}") String password) {

        var hostConfig = new HttpHost(scheme, host, port);
        var builder = ApacheHttpClient5TransportBuilder.builder(hostConfig);

        if (!username.isBlank()) {
            var creds = new BasicCredentialsProvider();
            creds.setCredentials(new AuthScope(hostConfig),
                    new UsernamePasswordCredentials(username, password.toCharArray()));
            builder.setHttpClientConfigCallback(b -> b.setDefaultCredentialsProvider(creds));
        }

        var transport = builder.build();
        return new OpenSearchClient(transport);
    }
}
