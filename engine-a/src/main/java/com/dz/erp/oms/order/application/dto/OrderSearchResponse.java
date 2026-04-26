package com.dz.erp.oms.order.application.dto;

import java.util.List;
import java.util.Map;

/**
 * Search result envelope for {@code GET /oms/v1/orders/search}. Each hit is a flat
 * map keyed by field name — it mirrors the denormalized document shape written by
 * {@code OrderSearchIndexer} (status, customer, wilaya, totals, timeline, ...).
 */
public record OrderSearchResponse(List<Map<String, Object>> hits, long total, int page, int size) {}
