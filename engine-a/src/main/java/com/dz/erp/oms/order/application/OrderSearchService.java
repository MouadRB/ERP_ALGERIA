package com.dz.erp.oms.order.application;

import com.dz.erp.oms.order.application.dto.OrderSearchResponse;
import com.dz.erp.oms.order.domain.port.OrderSearchPort;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Stage 11 — thin façade over {@link OrderSearchPort}. Applies the current tenant
 * and bounds page/size before delegating to the adapter.
 */
@Service
@RequiredArgsConstructor
public class OrderSearchService {

    private final OrderSearchPort searchPort;

    public OrderSearchResponse search(String q, Map<String, String> filters, int page, int size) {
        var tenantId = AuthContext.currentTenantId();
        int safePage = Math.max(0, page);
        int safeSize = Math.min(100, Math.max(1, size));
        var filtered = new LinkedHashMap<String, String>();
        if (filters != null) filters.forEach((k, v) -> { if (v != null && !v.isBlank()) filtered.put(k, v); });
        var result = searchPort.search(tenantId, q, filtered, safePage, safeSize);
        return new OrderSearchResponse(result.hits(), result.total(), safePage, safeSize);
    }
}
