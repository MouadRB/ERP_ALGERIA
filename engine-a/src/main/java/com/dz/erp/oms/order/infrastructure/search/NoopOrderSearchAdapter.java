package com.dz.erp.oms.order.infrastructure.search;

import com.dz.erp.oms.order.domain.port.OrderSearchPort;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Fallback adapter registered when the OpenSearch client bean is absent
 * (i.e. {@code oms.search.enabled=false}). Writes are swallowed so indexer
 * listeners are harmless in environments without a cluster; reads raise
 * {@link ErrorCode#OMS_SEARCH_UNAVAILABLE} so the search endpoint returns a
 * clear 503 instead of a cryptic NPE.
 */
@Component
@ConditionalOnMissingBean(OpenSearchClient.class)
public class NoopOrderSearchAdapter implements OrderSearchPort {

    @Override
    public void upsert(UUID orderId, Map<String, Object> document) { /* no-op */ }

    @Override
    public void delete(UUID orderId) { /* no-op */ }

    @Override
    public SearchResult search(String tenantId, String q, Map<String, String> filters, int page, int size) {
        throw new BusinessException(ErrorCode.OMS_SEARCH_UNAVAILABLE);
    }
}
