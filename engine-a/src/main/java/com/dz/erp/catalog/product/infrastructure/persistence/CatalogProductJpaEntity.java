package com.dz.erp.catalog.product.infrastructure.persistence;

import com.dz.erp.catalog.shared.domain.MaskedReason;
import com.dz.erp.catalog.shared.domain.PublicationStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(schema = "catalog_schema", name = "catalog_products",
       uniqueConstraints = @UniqueConstraint(name = "uk_catprod_tenant_sku", columnNames = {"tenant_id", "sku_code"}))
public class CatalogProductJpaEntity {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Column(name = "sku_code", nullable = false, length = 50)
    private String skuCode;

    @Column(name = "category_id", nullable = false, columnDefinition = "uuid")
    private UUID categoryId;

    @Enumerated(EnumType.STRING)
    @Column(name = "publication_status", nullable = false, length = 30)
    private PublicationStatus publicationStatus = PublicationStatus.DRAFT;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "auto_unpublish_at")
    private LocalDateTime autoUnpublishAt;

    @Column(name = "channel_web", nullable = false)
    private boolean channelWeb = false;

    @Column(name = "channel_whatsapp", nullable = false)
    private boolean channelWhatsapp = false;

    @Column(name = "channel_marketplace", nullable = false)
    private boolean channelMarketplace = false;

    @Column(name = "visibility_score", precision = 4, scale = 2)
    private BigDecimal visibilityScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "masked_reason", length = 30)
    private MaskedReason maskedReason;

    @Column(name = "featured_homepage", nullable = false)
    private boolean featuredHomepage = false;

    @Column(name = "badge_stock_limit", nullable = false)
    private boolean badgeStockLimit = false;

    @Column(name = "stock_limit_threshold", nullable = false)
    private int stockLimitThreshold = 10;

    @Column(name = "include_in_sponsored_search", nullable = false)
    private boolean includeInSponsoredSearch = false;

    @Column(name = "active_rules_json", length = 500)
    private String activeRulesJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        var now = LocalDateTime.now();
        if (this.createdAt == null) this.createdAt = now;
        if (this.updatedAt == null) this.updatedAt = now;
        if (this.id == null) this.id = UUID.randomUUID();
    }

    @PreUpdate
    void preUpdate() { this.updatedAt = LocalDateTime.now(); }

    // ── Getters & Setters ──
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public String getSkuCode() { return skuCode; }
    public void setSkuCode(String skuCode) { this.skuCode = skuCode; }
    public UUID getCategoryId() { return categoryId; }
    public void setCategoryId(UUID categoryId) { this.categoryId = categoryId; }
    public PublicationStatus getPublicationStatus() { return publicationStatus; }
    public void setPublicationStatus(PublicationStatus publicationStatus) { this.publicationStatus = publicationStatus; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public LocalDateTime getAutoUnpublishAt() { return autoUnpublishAt; }
    public void setAutoUnpublishAt(LocalDateTime autoUnpublishAt) { this.autoUnpublishAt = autoUnpublishAt; }
    public boolean isChannelWeb() { return channelWeb; }
    public void setChannelWeb(boolean channelWeb) { this.channelWeb = channelWeb; }
    public boolean isChannelWhatsapp() { return channelWhatsapp; }
    public void setChannelWhatsapp(boolean channelWhatsapp) { this.channelWhatsapp = channelWhatsapp; }
    public boolean isChannelMarketplace() { return channelMarketplace; }
    public void setChannelMarketplace(boolean channelMarketplace) { this.channelMarketplace = channelMarketplace; }
    public BigDecimal getVisibilityScore() { return visibilityScore; }
    public void setVisibilityScore(BigDecimal visibilityScore) { this.visibilityScore = visibilityScore; }
    public MaskedReason getMaskedReason() { return maskedReason; }
    public void setMaskedReason(MaskedReason maskedReason) { this.maskedReason = maskedReason; }
    public boolean isFeaturedHomepage() { return featuredHomepage; }
    public void setFeaturedHomepage(boolean featuredHomepage) { this.featuredHomepage = featuredHomepage; }
    public boolean isBadgeStockLimit() { return badgeStockLimit; }
    public void setBadgeStockLimit(boolean badgeStockLimit) { this.badgeStockLimit = badgeStockLimit; }
    public int getStockLimitThreshold() { return stockLimitThreshold; }
    public void setStockLimitThreshold(int stockLimitThreshold) { this.stockLimitThreshold = stockLimitThreshold; }
    public boolean isIncludeInSponsoredSearch() { return includeInSponsoredSearch; }
    public void setIncludeInSponsoredSearch(boolean includeInSponsoredSearch) { this.includeInSponsoredSearch = includeInSponsoredSearch; }
    public String getActiveRulesJson() { return activeRulesJson; }
    public void setActiveRulesJson(String activeRulesJson) { this.activeRulesJson = activeRulesJson; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
