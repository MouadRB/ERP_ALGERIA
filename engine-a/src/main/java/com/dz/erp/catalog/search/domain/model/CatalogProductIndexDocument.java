package com.dz.erp.catalog.search.domain.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Flat document indexed in OpenSearch — index name: "ferza_products_{tenantId}".
 *
 * Assembled from 4 sources:
 *   - CatalogProduct (local DB: channels, badges, score)
 *   - PIM via REST (names, price, keywords, variants, images, returnRate)
 *   - MDM via REST (wilayas deliverable)
 *   - Category (local DB: category path)
 *
 * This is a read-model — optimized for search, not for writes.
 */
public record CatalogProductIndexDocument(
        // ── Identity ──
        String skuCode,
        String tenantId,

        // ── PIM content (fetched via REST) ──
        String nameFr,
        String nameAr,
        String descriptionFr,
        String descriptionAr,
        String brand,
        BigDecimal priceTtc,
        int stockDisponible,
        String principalImageUrl,
        BigDecimal returnRate,

        // ── Category (local DB) ──
        List<String> categoryPath,      // ["Electronique","Smartphones","Acc. iPhone"]
        String categoryNameFr,
        String categoryNameAr,

        // ── Catalog state (local DB) ──
        List<String> channels,          // ["WEB","WHATSAPP"]
        List<String> badges,            // ["STOCK_LIMITE","TOP_VENDEUR"]
        BigDecimal relevanceScore,
        String topSearchPosition,
        Instant publishedAt,

        // ── PIM SEO (fetched via REST) ──
        List<String> keywords,

        // ── PIM variants (fetched via REST) ──
        List<String> variantLabels,     // ["T.39","T.40","T.41"]

        // ── MDM (fetched via REST) ──
        List<String> wilayas,           // deliverable wilaya codes

        // ── Meta ──
        Instant indexedAt
) {}
