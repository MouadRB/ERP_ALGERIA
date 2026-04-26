package com.dz.erp.catalog.search.infrastructure.cache;

import com.dz.erp.catalog.search.shared.port.CatalogCachePort;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisCatalogCacheAdapter implements CatalogCachePort {

    private final StringRedisTemplate redis;
    private final ObjectMapper json;

    @Override
    public <T> Optional<T> get(String key, Class<T> type) {
        try {
            var value = redis.opsForValue().get(key);
            if (value == null) return Optional.empty();
            return Optional.of(json.readValue(value, type));
        } catch (Exception e) {
            log.warn("Redis GET failed for key {}: {}", key, e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    public void put(String key, Object value, Duration ttl) {
        try {
            var serialized = json.writeValueAsString(value);
            redis.opsForValue().set(key, serialized, ttl);
        } catch (Exception e) {
            log.warn("Redis PUT failed for key {}: {}", key, e.getMessage());
        }
    }

    @Override
    public void evictByPattern(String pattern) {
        try {
            Set<String> keys = redis.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redis.delete(keys);
                log.debug("Redis EVICT pattern '{}': {} keys removed", pattern, keys.size());
            }
        } catch (Exception e) {
            log.warn("Redis EVICT failed for pattern {}: {}", pattern, e.getMessage());
        }
    }
}
