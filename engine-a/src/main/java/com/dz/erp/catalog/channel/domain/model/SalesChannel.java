package com.dz.erp.catalog.channel.domain.model;

import com.dz.erp.catalog.channel.domain.event.ChannelDomainEvent;
import com.dz.erp.catalog.shared.domain.ChannelType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * SalesChannel aggregate — pure Java domain entity.
 * No Spring, JPA, or Lombok annotations.
 * <p>
 * Represents a publication channel (WEB, WHATSAPP, MARKETPLACE).
 * Each channel holds its own rule configuration and sync state.
 */
public class SalesChannel {

    // ── Identity ──
    private final UUID id;
    private final String tenantId;
    private final ChannelType channelType;

    // ── State ──
    private boolean active;
    private SalesChannelRules rules;

    // ── Sync config (WhatsApp-specific, but stored generically) ──
    private int syncFrequencyMinutes;
    private String welcomeMessageFr;
    private String welcomeMessageAr;
    private String catalogId;
    private String opensearchIndex;

    // ── Sync tracking ──
    private LocalDateTime lastSyncAt;
    private int lastSyncProductCount;
    private int lastSyncErrorCount;

    // ── Audit ──
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long version;

    // ── Domain events (transient — not persisted) ──
    private final List<ChannelDomainEvent> pendingEvents = new ArrayList<>();

    // ──────────────────────────────────────────────
    // Factory methods
    // ──────────────────────────────────────────────

    /**
     * Create a new SalesChannel. Used for first-time creation (e.g., Phase 3 Marketplace).
     * Fires ChannelActivated event if created in active state.
     */
    public static SalesChannel create(String tenantId, ChannelType channelType,
                                      SalesChannelRules rules, String actorId,
                                      LocalDateTime now) {
        var channel = new SalesChannel(
                UUID.randomUUID(), tenantId, channelType, true, rules,
                120, null, null, null, null,
                null, 0, 0, now, now, 0L
        );
        channel.pendingEvents.add(new ChannelDomainEvent.ChannelActivated(
                channelType, actorId, tenantId));
        return channel;
    }

    /**
     * Reconstitute from database. No events fired — this is a read operation.
     */
    public static SalesChannel reconstitute(UUID id, String tenantId, ChannelType channelType,
                                            boolean active, SalesChannelRules rules,
                                            int syncFrequencyMinutes, String welcomeMessageFr,
                                            String welcomeMessageAr, String catalogId,
                                            String opensearchIndex, LocalDateTime lastSyncAt,
                                            int lastSyncProductCount, int lastSyncErrorCount,
                                            LocalDateTime createdAt, LocalDateTime updatedAt,
                                            long version) {
        return new SalesChannel(id, tenantId, channelType, active, rules,
                syncFrequencyMinutes, welcomeMessageFr, welcomeMessageAr,
                catalogId, opensearchIndex, lastSyncAt,
                lastSyncProductCount, lastSyncErrorCount,
                createdAt, updatedAt, version);
    }

    // ──────────────────────────────────────────────
    // Private constructor
    // ──────────────────────────────────────────────

    private SalesChannel(UUID id, String tenantId, ChannelType channelType, boolean active,
                         SalesChannelRules rules, int syncFrequencyMinutes,
                         String welcomeMessageFr, String welcomeMessageAr,
                         String catalogId, String opensearchIndex,
                         LocalDateTime lastSyncAt, int lastSyncProductCount,
                         int lastSyncErrorCount, LocalDateTime createdAt,
                         LocalDateTime updatedAt, long version) {
        this.id = id;
        this.tenantId = tenantId;
        this.channelType = channelType;
        this.active = active;
        this.rules = rules;
        this.syncFrequencyMinutes = syncFrequencyMinutes;
        this.welcomeMessageFr = welcomeMessageFr;
        this.welcomeMessageAr = welcomeMessageAr;
        this.catalogId = catalogId;
        this.opensearchIndex = opensearchIndex;
        this.lastSyncAt = lastSyncAt;
        this.lastSyncProductCount = lastSyncProductCount;
        this.lastSyncErrorCount = lastSyncErrorCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.version = version;
    }

    // ──────────────────────────────────────────────
    // Domain methods
    // ──────────────────────────────────────────────

    /**
     * Update the channel's rule configuration.
     * Fires ChannelRulesUpdated with both old and new rules for audit trail.
     *
     * @param newRules validated rule set (SalesChannelRules validates at construction)
     * @param actorId  the user performing the update
     */
    public void updateRules(SalesChannelRules newRules, String actorId) {
        var previousRules = this.rules;
        this.rules = newRules;
        this.updatedAt = LocalDateTime.now();
        this.pendingEvents.add(new ChannelDomainEvent.ChannelRulesUpdated(
                this.channelType, previousRules, newRules, actorId, this.tenantId));
    }

    /**
     * Record a completed sync operation (WhatsApp or future Marketplace).
     * Fires SyncCompleted for audit trail.
     */
    public void recordSync(LocalDateTime syncTime, int synced, int errors,
                           int excluded, long durationMs) {
        this.lastSyncAt = syncTime;
        this.lastSyncProductCount = synced;
        this.lastSyncErrorCount = errors;
        this.updatedAt = LocalDateTime.now();
        this.pendingEvents.add(new ChannelDomainEvent.SyncCompleted(
                this.channelType, synced, excluded, errors, durationMs, this.tenantId));
    }

    /**
     * Activate the channel. Only SUPER_ADMIN should call this.
     */
    public void activate(String actorId) {
        if (this.active) return; // idempotent
        this.active = true;
        this.updatedAt = LocalDateTime.now();
        this.pendingEvents.add(new ChannelDomainEvent.ChannelActivated(
                this.channelType, actorId, this.tenantId));
    }

    /**
     * Deactivate the channel. All products on this channel become invisible.
     */
    public void deactivate(String actorId) {
        if (!this.active) return; // idempotent
        this.active = false;
        this.updatedAt = LocalDateTime.now();
        this.pendingEvents.add(new ChannelDomainEvent.ChannelDeactivated(
                this.channelType, actorId, this.tenantId));
    }

    // ──────────────────────────────────────────────
    // Getters (read-only access — no setters)
    // ──────────────────────────────────────────────

    public UUID getId() {
        return id;
    }

    public String getTenantId() {
        return tenantId;
    }

    public ChannelType getChannelType() {
        return channelType;
    }

    public boolean isActive() {
        return active;
    }

    public SalesChannelRules getRules() {
        return rules;
    }

    public int getSyncFrequencyMinutes() {
        return syncFrequencyMinutes;
    }

    public String getWelcomeMessageFr() {
        return welcomeMessageFr;
    }

    public String getWelcomeMessageAr() {
        return welcomeMessageAr;
    }

    public String getCatalogId() {
        return catalogId;
    }

    public String getOpensearchIndex() {
        return opensearchIndex;
    }

    public LocalDateTime getLastSyncAt() {
        return lastSyncAt;
    }

    public int getLastSyncProductCount() {
        return lastSyncProductCount;
    }

    public int getLastSyncErrorCount() {
        return lastSyncErrorCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public long getVersion() {
        return version;
    }
}
