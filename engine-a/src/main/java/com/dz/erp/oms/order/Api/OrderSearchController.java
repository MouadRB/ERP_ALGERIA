package com.dz.erp.oms.order.Api;

import com.dz.erp.oms.common.OmsApiPaths;
import com.dz.erp.oms.common.OmsRoles;
import com.dz.erp.oms.order.application.OrderSearchService;
import com.dz.erp.oms.order.application.dto.OrderSearchResponse;
import com.dz.erp.shared.api.ApiResult;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Stage 11 — full-text + faceted search across the denormalized {@code oms-orders}
 * OpenSearch index. Filters accepted: {@code status}, {@code wilaya_code},
 * {@code channel_code}, {@code customer_id}, {@code payment_method}.
 *
 * <p>Returns 503 ({@code oms.search.unavailable}) when the feature flag is off —
 * the no-op adapter signals that explicitly.
 */
@RestController
@RequestMapping(OmsApiPaths.ORDERS_SEARCH)
@RequiredArgsConstructor
public class OrderSearchController {

    private final OrderSearchService searchService;

    @GetMapping
    @PreAuthorize("hasAnyRole('" + OmsRoles.SUPER_ADMIN + "','" + OmsRoles.SALES_MANAGER + "','"
            + OmsRoles.CS_AGENT + "','" + OmsRoles.CRM_AGENT + "','" + OmsRoles.WAREHOUSE_OPERATOR + "','"
            + OmsRoles.LOGISTICS_AGENT + "','" + OmsRoles.PROCUREMENT_MANAGER + "','"
            + OmsRoles.FINANCE_MANAGER + "','" + OmsRoles.REPORTING_ANALYST + "')")
    public ApiResult<OrderSearchResponse> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(name = "wilaya_code", required = false) String wilayaCode,
            @RequestParam(name = "channel_code", required = false) String channelCode,
            @RequestParam(name = "customer_id", required = false) String customerId,
            @RequestParam(name = "payment_method", required = false) String paymentMethod,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size
    ) {
        var filters = new LinkedHashMap<String, String>();
        putIfSet(filters, "status", status);
        putIfSet(filters, "wilaya_code", wilayaCode);
        putIfSet(filters, "channel_code", channelCode);
        putIfSet(filters, "customer_id", customerId);
        putIfSet(filters, "payment_method", paymentMethod);
        return ApiResult.ok(searchService.search(q, filters, page, size));
    }

    private static void putIfSet(Map<String, String> m, String k, String v) {
        if (v != null && !v.isBlank()) m.put(k, v);
    }
}
