package com.dz.erp.catalog.search.shared.port;

import java.time.Duration;
import java.util.Optional;

/**
 * Port for caching catalog search results.
 * Infrastructure implementation uses Redis (or any cache provider).
 */
public interface CatalogCachePort {

    <T> Optional<T> get(String key, Class<T> type);

    void put(String key, Object value, Duration ttl);

    void evictByPattern(String pattern);
}
