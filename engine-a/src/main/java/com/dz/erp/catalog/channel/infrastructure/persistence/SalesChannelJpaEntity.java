package com.dz.erp.catalog.channel.infrastructure.persistence;

import com.dz.erp.catalog.shared.domain.ChannelType;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(schema = "catalog_schema", name = "sales_channels",
       uniqueConstraints = @UniqueConstraint(
               name = "uk_channel_tenant_type",
               columnNames = {"tenant_id", "channel_type"}))
public class SalesChannelJpaEntity {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel_type", nullable = false, length = 20)
    private ChannelType channelType;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    // ── Rule columns (embedded from SalesChannelRules value object) ──

    @Column(name = "auto_mask_on_zero_stock", nullable = false)
    private boolean autoMaskOnZeroStock = true;

    @Column(name = "auto_republish_on_stock", nullable = false)
    private boolean autoRepublishOnStock = true;

    @Column(name = "exclude_zero_price", nullable = false)
    private boolean excludeZeroPrice = true;

    @Column(name = "exclude_negative_stock", nullable = false)
    private boolean excludeNegativeStock = true;

    @Column(name = "exclude_ocr_draft", nullable = false)
    private boolean excludeOcrDraft = true;

    @Column(name = "min_price_dzd")
    private Integer minPriceDzd = 500;

    @Column(name = "max_price_dzd")
    private Integer maxPriceDzd;

    @Column(name = "exclude_variants_individual", nullable = false)
    private boolean excludeVariantsIndividual = true;

    // ── Sync config ──

    @Column(name = "sync_frequency_minutes", nullable = false)
    private int syncFrequencyMinutes = 120;

    @Column(name = "welcome_message_fr", columnDefinition = "TEXT")
    private String welcomeMessageFr;

    @Column(name = "welcome_message_ar", columnDefinition = "TEXT")
    private String welcomeMessageAr;

    @Column(name = "catalog_id", length = 100)
    private String catalogId;

    @Column(name = "opensearch_index", length = 100)
    private String opensearchIndex;

    // ── Sync tracking ──

    @Column(name = "last_sync_at")
    private LocalDateTime lastSyncAt;

    @Column(name = "last_sync_product_count")
    private int lastSyncProductCount;

    @Column(name = "last_sync_error_count")
    private int lastSyncErrorCount;

    // ── Audit & Versioning ──

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Version
    @Column(name = "version")
    private long version;

    @PrePersist
    void prePersist() {
        var now = LocalDateTime.now();
        if (this.createdAt == null) this.createdAt = now;
        if (this.updatedAt == null) this.updatedAt = now;
        if (this.id == null) this.id = UUID.randomUUID();
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ── Getters & Setters ──

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public ChannelType getChannelType() { return channelType; }
    public void setChannelType(ChannelType channelType) { this.channelType = channelType; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public boolean isAutoMaskOnZeroStock() { return autoMaskOnZeroStock; }
    public void setAutoMaskOnZeroStock(boolean v) { this.autoMaskOnZeroStock = v; }

    public boolean isAutoRepublishOnStock() { return autoRepublishOnStock; }
    public void setAutoRepublishOnStock(boolean v) { this.autoRepublishOnStock = v; }

    public boolean isExcludeZeroPrice() { return excludeZeroPrice; }
    public void setExcludeZeroPrice(boolean v) { this.excludeZeroPrice = v; }

    public boolean isExcludeNegativeStock() { return excludeNegativeStock; }
    public void setExcludeNegativeStock(boolean v) { this.excludeNegativeStock = v; }

    public boolean isExcludeOcrDraft() { return excludeOcrDraft; }
    public void setExcludeOcrDraft(boolean v) { this.excludeOcrDraft = v; }

    public Integer getMinPriceDzd() { return minPriceDzd; }
    public void setMinPriceDzd(Integer v) { this.minPriceDzd = v; }

    public Integer getMaxPriceDzd() { return maxPriceDzd; }
    public void setMaxPriceDzd(Integer v) { this.maxPriceDzd = v; }

    public boolean isExcludeVariantsIndividual() { return excludeVariantsIndividual; }
    public void setExcludeVariantsIndividual(boolean v) { this.excludeVariantsIndividual = v; }

    public int getSyncFrequencyMinutes() { return syncFrequencyMinutes; }
    public void setSyncFrequencyMinutes(int v) { this.syncFrequencyMinutes = v; }

    public String getWelcomeMessageFr() { return welcomeMessageFr; }
    public void setWelcomeMessageFr(String v) { this.welcomeMessageFr = v; }

    public String getWelcomeMessageAr() { return welcomeMessageAr; }
    public void setWelcomeMessageAr(String v) { this.welcomeMessageAr = v; }

    public String getCatalogId() { return catalogId; }
    public void setCatalogId(String v) { this.catalogId = v; }

    public String getOpensearchIndex() { return opensearchIndex; }
    public void setOpensearchIndex(String v) { this.opensearchIndex = v; }

    public LocalDateTime getLastSyncAt() { return lastSyncAt; }
    public void setLastSyncAt(LocalDateTime v) { this.lastSyncAt = v; }

    public int getLastSyncProductCount() { return lastSyncProductCount; }
    public void setLastSyncProductCount(int v) { this.lastSyncProductCount = v; }

    public int getLastSyncErrorCount() { return lastSyncErrorCount; }
    public void setLastSyncErrorCount(int v) { this.lastSyncErrorCount = v; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public long getVersion() { return version; }
    public void setVersion(long version) { this.version = version; }
}
