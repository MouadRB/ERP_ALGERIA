package com.dz.erp.catalog.analytics.application;

import com.dz.erp.catalog.analytics.application.dto.CatalogAnalyticsResponse;
import com.dz.erp.catalog.product.domain.port.CatalogProductRepository;
import com.dz.erp.catalog.search.domain.port.SearchIndexPort;
import com.dz.erp.catalog.shared.domain.ChannelType;
import com.dz.erp.catalog.shared.domain.PublicationStatus;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CatalogAnalyticsService {
    private final CatalogProductRepository productRepo;
    private final SearchIndexPort searchIndexPort;

    @Transactional(readOnly = true)
    public CatalogAnalyticsResponse getAnalytics() {
        var tid = AuthContext.currentTenantId();
        long published = productRepo.countByStatusAndTenantId(PublicationStatus.PUBLISHED, tid);
        long masked = productRepo.countByStatusAndTenantId(PublicationStatus.MASKED_AUTO, tid)
                + productRepo.countByStatusAndTenantId(PublicationStatus.MASKED_MANUAL, tid);
        double stability = published + masked > 0 ? (double) published / (published + masked) * 100 : 100.0;

        // Channel coverage: count products per channel combination
        var allPublished = productRepo.findAllByStatusAndTenantId(PublicationStatus.PUBLISHED, tid);
        long webAndWhatsapp = allPublished.stream()
                .filter(p -> p.getActiveChannels().contains(ChannelType.WEB) && p.getActiveChannels().contains(ChannelType.WHATSAPP))
                .count();
        long webOnly = allPublished.stream()
                .filter(p -> p.getActiveChannels().contains(ChannelType.WEB) && !p.getActiveChannels().contains(ChannelType.WHATSAPP))
                .count();
        long waOnly = allPublished.stream()
                .filter(p -> !p.getActiveChannels().contains(ChannelType.WEB) && p.getActiveChannels().contains(ChannelType.WHATSAPP))
                .count();
        long unpublished = masked + productRepo.countByStatusAndTenantId(PublicationStatus.DRAFT, tid);
        var coverage = new CatalogAnalyticsResponse.ChannelCoverage(webAndWhatsapp, webOnly, waOnly, unpublished);

        // Index alerts: compare OpenSearch docCount vs PUBLISHED count
        var indexAlerts = new ArrayList<CatalogAnalyticsResponse.IndexAlert>();
        try {
            var indexStatus = searchIndexPort.getStatus(tid);
            long indexedDocs = indexStatus.documentCount();
            if (indexedDocs < published) {
                long missing = published - indexedDocs;
                indexAlerts.add(new CatalogAnalyticsResponse.IndexAlert(
                        "WARNING", null, missing + " published products not indexed in OpenSearch"));
            }
            if ("red".equals(indexStatus.clusterStatus())) {
                indexAlerts.add(new CatalogAnalyticsResponse.IndexAlert(
                        "CRITICAL", null, "OpenSearch cluster health is RED"));
            }
        } catch (Exception e) {
            log.warn("Analytics: failed to fetch OpenSearch status: {}", e.getMessage());
            indexAlerts.add(new CatalogAnalyticsResponse.IndexAlert(
                    "ERROR", null, "OpenSearch unavailable: " + e.getMessage()));
        }

        return new CatalogAnalyticsResponse(stability, published, masked, List.of(), List.of(), coverage, indexAlerts);
    }
}
