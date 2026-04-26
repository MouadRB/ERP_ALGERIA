package com.dz.erp.catalog.product.domain.model;

import com.dz.erp.catalog.product.domain.event.CatalogDomainEvent;
import com.dz.erp.catalog.product.domain.util.DiagnosticResult;
import com.dz.erp.catalog.shared.domain.*;
import lombok.Getter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Getter
public class CatalogProduct {

    private final UUID id;
    private final String tenantId;
    private final String skuCode;
    private UUID categoryId;
    private PublicationStatus status;
    private MaskedReason maskedReason;
    private final Set<ChannelType> activeChannels;
    private final Set<VisibilityRule> activeRules;
    private LocalDateTime scheduledAt;
    private LocalDateTime autoUnpublishAt;
    private boolean featuredHomepage;
    private boolean badgeStockLimit;
    private int stockLimitThreshold;
    private boolean includeInSponsoredSearch;
    private BigDecimal visibilityScore;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private final List<CatalogDomainEvent> pendingEvents = new ArrayList<>();

    // ── Factory: create (assignment to category = DRAFT) ──
    public static CatalogProduct create(String skuCode, UUID categoryId, String tenantId) {
        Objects.requireNonNull(skuCode, "skuCode required");
        Objects.requireNonNull(categoryId, "categoryId required");
        Objects.requireNonNull(tenantId, "tenantId required");

        var product = new CatalogProduct(
                UUID.randomUUID(), tenantId, skuCode, categoryId,
                PublicationStatus.DRAFT, null,
                EnumSet.noneOf(ChannelType.class), EnumSet.noneOf(VisibilityRule.class),
                null, null, false, false, 10, false,
                BigDecimal.ZERO, LocalDateTime.now(), null);

        product.pendingEvents.add(new CatalogDomainEvent.CategoryAssigned(skuCode, categoryId, tenantId));
        return product;
    }

    // ── Factory: reconstitute from DB ──
    public static CatalogProduct reconstitute(
            UUID id, String tenantId, String skuCode, UUID categoryId,
            PublicationStatus status, MaskedReason maskedReason,
            Set<ChannelType> activeChannels, Set<VisibilityRule> activeRules,
            LocalDateTime scheduledAt, LocalDateTime autoUnpublishAt,
            boolean featuredHomepage, boolean badgeStockLimit, int stockLimitThreshold,
            boolean includeInSponsoredSearch, BigDecimal visibilityScore,
            LocalDateTime createdAt, LocalDateTime updatedAt) {
        return new CatalogProduct(id, tenantId, skuCode, categoryId, status, maskedReason,
                activeChannels != null && !activeChannels.isEmpty() ? EnumSet.copyOf(activeChannels) : EnumSet.noneOf(ChannelType.class),
                activeRules != null && !activeRules.isEmpty() ? EnumSet.copyOf(activeRules) : EnumSet.noneOf(VisibilityRule.class),
                scheduledAt, autoUnpublishAt, featuredHomepage, badgeStockLimit, stockLimitThreshold,
                includeInSponsoredSearch, visibilityScore, createdAt, updatedAt);
    }

    private CatalogProduct(UUID id, String tenantId, String skuCode, UUID categoryId,
                           PublicationStatus status, MaskedReason maskedReason,
                           Set<ChannelType> activeChannels, Set<VisibilityRule> activeRules,
                           LocalDateTime scheduledAt, LocalDateTime autoUnpublishAt,
                           boolean featuredHomepage, boolean badgeStockLimit, int stockLimitThreshold,
                           boolean includeInSponsoredSearch, BigDecimal visibilityScore,
                           LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.tenantId = tenantId;
        this.skuCode = skuCode;
        this.categoryId = categoryId;
        this.status = status;
        this.maskedReason = maskedReason;
        this.activeChannels = activeChannels;
        this.activeRules = activeRules;
        this.scheduledAt = scheduledAt;
        this.autoUnpublishAt = autoUnpublishAt;
        this.featuredHomepage = featuredHomepage;
        this.badgeStockLimit = badgeStockLimit;
        this.stockLimitThreshold = stockLimitThreshold;
        this.includeInSponsoredSearch = includeInSponsoredSearch;
        this.visibilityScore = visibilityScore;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ── State machine: publish ──
    public void publish(String actorId, Set<ChannelType> channels) {
        if (status == PublicationStatus.DISCONTINUED)
            throw new IllegalStateException("Cannot publish a DISCONTINUED product");
        if (channels == null || channels.isEmpty())
            throw new IllegalArgumentException("At least one channel required");

        this.status = PublicationStatus.PUBLISHED;
        this.maskedReason = null;
        this.scheduledAt = null;
        this.activeChannels.clear();
        this.activeChannels.addAll(channels);
        this.updatedAt = LocalDateTime.now();

        pendingEvents.add(new CatalogDomainEvent.ProductPublished(skuCode, Set.copyOf(activeChannels), actorId, tenantId));
    }

    // ── State machine: maskAuto (IDEMPOTENT) ──
    public void maskAuto(MaskedReason reason) {
        if (status == PublicationStatus.DISCONTINUED) return; // silently ignore
        if (status == PublicationStatus.MASKED_AUTO && this.maskedReason == reason) return; // idempotent

        this.status = PublicationStatus.MASKED_AUTO;
        this.maskedReason = reason;
        this.updatedAt = LocalDateTime.now();

        pendingEvents.add(new CatalogDomainEvent.ProductMaskedAuto(skuCode, reason, Set.copyOf(activeChannels), tenantId));
    }

    // ── State machine: maskManual ──
    public void maskManual(String actorId) {
        if (status != PublicationStatus.PUBLISHED)
            throw new IllegalStateException("Can only manually mask a PUBLISHED product, current: " + status);

        this.status = PublicationStatus.MASKED_MANUAL;
        this.maskedReason = MaskedReason.MANUAL;
        this.updatedAt = LocalDateTime.now();

        pendingEvents.add(new CatalogDomainEvent.ProductMaskedManual(skuCode, actorId, tenantId));
    }

    // ── State machine: unmask (only for AUTO_STOCK_ZERO) ──
    public void unmask() {
        if (status != PublicationStatus.MASKED_AUTO || maskedReason != MaskedReason.AUTO_STOCK_ZERO)
            throw new IllegalStateException("Can only unmask AUTO_STOCK_ZERO masks, current: " + status + "/" + maskedReason);

        this.status = PublicationStatus.PUBLISHED;
        this.maskedReason = null;
        this.updatedAt = LocalDateTime.now();

        pendingEvents.add(new CatalogDomainEvent.ProductPublished(skuCode, Set.copyOf(activeChannels), "SYSTEM", tenantId));
    }

    // ── State machine: schedule ──
    public void schedule(LocalDateTime scheduledAt) {
        if (status == PublicationStatus.DISCONTINUED)
            throw new IllegalStateException("Cannot schedule a DISCONTINUED product");
        if (scheduledAt == null || !scheduledAt.isAfter(LocalDateTime.now()))
            throw new IllegalArgumentException("scheduledAt must be in the future");

        this.status = PublicationStatus.SCHEDULED;
        this.scheduledAt = scheduledAt;
        this.updatedAt = LocalDateTime.now();

        pendingEvents.add(new CatalogDomainEvent.ProductScheduled(skuCode, scheduledAt, tenantId));
    }

    // ── State machine: cancelSchedule ──
    public void cancelSchedule(String actorId) {
        if (status != PublicationStatus.SCHEDULED)
            throw new IllegalStateException("Can only cancel a SCHEDULED product, current: " + status);

        this.status = PublicationStatus.DRAFT;
        this.scheduledAt = null;
        this.updatedAt = LocalDateTime.now();

        pendingEvents.add(new CatalogDomainEvent.ScheduleCancelled(skuCode, actorId, tenantId));
    }

    // ── State machine: discontinue (terminal — always allowed) ──
    public void discontinue() {
        this.status = PublicationStatus.DISCONTINUED;
        this.maskedReason = MaskedReason.DISCONTINUED;
        this.activeChannels.clear();
        this.updatedAt = LocalDateTime.now();

        pendingEvents.add(new CatalogDomainEvent.ProductDiscontinuedInCatalog(skuCode, tenantId));
    }

    // ── Toggle channel ──
    public void toggleChannel(ChannelType channel, boolean enabled) {
        if (enabled) activeChannels.add(channel);
        else activeChannels.remove(channel);
        this.updatedAt = LocalDateTime.now();
        pendingEvents.add(new CatalogDomainEvent.ChannelChanged(skuCode, channel, enabled, tenantId));
    }

    // ── Toggle rule ──
    public void toggleRule(VisibilityRule rule, boolean enabled) {
        if (enabled) activeRules.add(rule);
        else activeRules.remove(rule);
        this.updatedAt = LocalDateTime.now();
        pendingEvents.add(new CatalogDomainEvent.RuleToggled(skuCode, rule, enabled, tenantId));
    }

    // ── Set auto-unpublish date ──
    public void setAutoUnpublishAt(LocalDateTime autoUnpublishAt) {
        this.autoUnpublishAt = autoUnpublishAt;
        this.updatedAt = LocalDateTime.now();
    }

    // ── Diagnostic score (called with external data from PIM/Inventory) ──
    public DiagnosticResult computeDiagnosticScore(boolean pimActive, boolean hasStock,
                                                   boolean hasPrice, boolean notOcrDraft, boolean hasChannels) {
        var checks = new ArrayList<DiagnosticResult.Check>();
        BigDecimal score = BigDecimal.ZERO;

        // Stock: 30%
        checks.add(new DiagnosticResult.Check("Stock disponible > 0", hasStock, hasStock ? "Visible" : "Rupture"));
        if (hasStock) score = score.add(new BigDecimal("0.30"));

        // PIM Active: 25%
        checks.add(new DiagnosticResult.Check("Statut PIM: Actif", pimActive, pimActive ? "Actif" : "Non actif"));
        if (pimActive) score = score.add(new BigDecimal("0.25"));

        // Price: 20%
        checks.add(new DiagnosticResult.Check("Prix > 0 DZD", hasPrice, hasPrice ? "OK" : "Prix absent"));
        if (hasPrice) score = score.add(new BigDecimal("0.20"));

        // Not OCR Draft: 15%
        checks.add(new DiagnosticResult.Check("Brouillon OCR: Non", notOcrDraft, notOcrDraft ? "OK" : "Brouillon non validé"));
        if (notOcrDraft) score = score.add(new BigDecimal("0.15"));

        // Has channels: 10%
        checks.add(new DiagnosticResult.Check("Canaux actifs", hasChannels, hasChannels ? activeChannels.toString() : "Aucun canal"));
        if (hasChannels) score = score.add(new BigDecimal("0.10"));

        this.visibilityScore = score.setScale(2, RoundingMode.HALF_UP);
        return new DiagnosticResult(this.visibilityScore, checks);
    }

    // ── Drain events ──
    public List<CatalogDomainEvent> drainPendingEvents() {
        var events = List.copyOf(pendingEvents);
        pendingEvents.clear();
        return events;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        return id.equals(((CatalogProduct) o).id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }
}
