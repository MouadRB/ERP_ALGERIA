package com.dz.erp.catalog.category.infrastructure.cache;

import com.dz.erp.catalog.category.application.dto.CategoryTreeResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;

/**
 * Cache for category tree using Redis.
 * TTL: 5 minutes. Evicted on every category create/update/delete.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CategoryCacheService {

    private static final Duration TTL = Duration.ofMinutes(5);
    private static final String KEY_PREFIX = "catalog:category:tree:";
    private static final TypeReference<List<CategoryTreeResponse>> TREE_TYPE = new TypeReference<>() {};

    private final StringRedisTemplate redis;
    private final ObjectMapper json;

    public List<CategoryTreeResponse> getTree(String tenantId) {
        try {
            var value = redis.opsForValue().get(KEY_PREFIX + tenantId);
            if (value != null) {
                log.debug("Cache HIT: tree for tenant {}", tenantId);
                return json.readValue(value, TREE_TYPE);
            }
        } catch (Exception e) {
            log.warn("Redis GET failed for category tree (tenant {}): {}", tenantId, e.getMessage());
        }
        log.debug("Cache MISS: tree for tenant {}", tenantId);
        return null;
    }

    public void putTree(String tenantId, List<CategoryTreeResponse> tree) {
        try {
            redis.opsForValue().set(KEY_PREFIX + tenantId, json.writeValueAsString(tree), TTL);
            log.debug("Cache PUT: tree for tenant {} ({} root nodes)", tenantId, tree.size());
        } catch (Exception e) {
            log.warn("Redis PUT failed for category tree (tenant {}): {}", tenantId, e.getMessage());
        }
    }

    public void evictTree(String tenantId) {
        redis.delete(KEY_PREFIX + tenantId);
        log.debug("Cache EVICT: tree for tenant {}", tenantId);
    }

    public void evictCategory(String code, String tenantId) {
        redis.delete(KEY_PREFIX + tenantId);
        log.debug("Cache EVICT: category {} for tenant {} (tree evicted)", code, tenantId);
    }
}
