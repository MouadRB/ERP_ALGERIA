package com.dz.erp.catalog.analytics.application.dto;
import java.util.List;
public record CatalogAnalyticsResponse(
    double publicationStabilityPercent, long maxPublished, long maxMasked,
    List<TopSearch> topSearches, List<SearchGap> searchGaps,
    ChannelCoverage coverage, List<IndexAlert> indexAlerts) {
    public record TopSearch(String term, long count) {}
    public record SearchGap(String term, long sessionsPerWeek) {}
    public record ChannelCoverage(long webAndWhatsapp, long webOnly, long waOnly, long unpublished) {}
    public record IndexAlert(String severity, String skuCode, String issue) {}
}
