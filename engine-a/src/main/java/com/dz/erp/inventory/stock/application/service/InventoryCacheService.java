package com.dz.erp.inventory.stock.application.service;

import com.dz.erp.inventory.stock.application.dto.StockDashboardResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryCacheService {
    private static final Duration DASHBOARD_TTL = Duration.ofMinutes(2);
    private static final String DASHBOARD_KEY = "inventory:dashboard:";

    private final StringRedisTemplate redis;
    private final ObjectMapper json;

    public StockDashboardResponse getDashboard(String tenantId) {
        try {
            var raw = redis.opsForValue().get(DASHBOARD_KEY + tenantId);
            return raw != null ? json.readValue(raw, StockDashboardResponse.class) : null;
        } catch (Exception e) {
            log.warn("Redis read failed for dashboard, falling through to DB", e);
            return null;
        }
    }

    @SneakyThrows
    public void putDashboard(String tenantId, StockDashboardResponse dashboard) {
        redis.opsForValue().set(DASHBOARD_KEY + tenantId, json.writeValueAsString(dashboard), DASHBOARD_TTL);
    }

    public void evictDashboard(String tenantId) {
        redis.delete(DASHBOARD_KEY + tenantId);
    }
}
