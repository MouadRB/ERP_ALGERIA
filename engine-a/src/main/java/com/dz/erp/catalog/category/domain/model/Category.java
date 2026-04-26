package com.dz.erp.catalog.category.domain.model;

import com.dz.erp.catalog.category.domain.event.CatalogCategoryDomainEvent;
import com.dz.erp.catalog.category.domain.util.SlugGenerator;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.*;

@Getter
public class Category {

    private final UUID id;
    private final String tenantId;
    private UUID parentId;
    private String code;
    private String nameFr;
    private String nameAr;
    private String slugFr;
    private String slugAr;
    private String metaTitleFr;
    private String metaTitleAr;
    private String tvaCategoryCode;
    private Map<String, Boolean> channelConfig;
    private int position;
    private boolean active;
    private final LocalDateTime createdAt;
    private final String createdBy;
    private LocalDateTime updatedAt;

    // Transient — not persisted. Collected after domain operations, published by service.
    private final List<CatalogCategoryDomainEvent> pendingEvents = new ArrayList<>();

    // ── Factory: create ──
    public static Category create(String tenantId, String code, String nameFr, String nameAr,
                                  UUID parentId, String metaTitleFr, String metaTitleAr,
                                  String tvaCategoryCode, Map<String, Boolean> channelConfig,
                                  int position, String createdBy) {
        Objects.requireNonNull(code, "code required");
        Objects.requireNonNull(nameFr, "nameFr required");

        if (metaTitleFr != null && metaTitleFr.length() > 60)
            throw new IllegalArgumentException("metaTitleFr max 60 chars");
        if (metaTitleAr != null && metaTitleAr.length() > 60)
            throw new IllegalArgumentException("metaTitleAr max 60 chars");

        var id = UUID.randomUUID();
        var slugFr = SlugGenerator.generate(nameFr);
        var slugAr = nameAr != null ? SlugGenerator.generateAr(nameAr) : null;
        var config = channelConfig != null ? new HashMap<>(channelConfig) : new HashMap<>(Map.of("web", true, "whatsapp", true));

        var cat = new Category(id, tenantId, parentId, code, nameFr, nameAr,
                slugFr, slugAr, metaTitleFr, metaTitleAr,
                tvaCategoryCode, config, position, true,
                LocalDateTime.now(), createdBy, null);

        cat.pendingEvents.add(new CatalogCategoryDomainEvent.Created(
                id.toString(), code, tenantId, createdBy));

        return cat;
    }

    // ── Factory: reconstitute from DB — no events fired ──
    public static Category reconstitute(UUID id, String tenantId, UUID parentId, String code,
                                        String nameFr, String nameAr, String slugFr, String slugAr,
                                        String metaTitleFr, String metaTitleAr, String tvaCategoryCode,
                                        Map<String, Boolean> channelConfig, int position, boolean active,
                                        LocalDateTime createdAt, String createdBy, LocalDateTime updatedAt) {
        return new Category(id, tenantId, parentId, code, nameFr, nameAr,
                slugFr, slugAr, metaTitleFr, metaTitleAr,
                tvaCategoryCode, channelConfig != null ? new HashMap<>(channelConfig) : new HashMap<>(),
                position, active, createdAt, createdBy, updatedAt);
    }

    private Category(UUID id, String tenantId, UUID parentId, String code,
                     String nameFr, String nameAr, String slugFr, String slugAr,
                     String metaTitleFr, String metaTitleAr, String tvaCategoryCode,
                     Map<String, Boolean> channelConfig, int position, boolean active,
                     LocalDateTime createdAt, String createdBy, LocalDateTime updatedAt) {
        this.id = id;
        this.tenantId = tenantId;
        this.parentId = parentId;
        this.code = code;
        this.nameFr = nameFr;
        this.nameAr = nameAr;
        this.slugFr = slugFr;
        this.slugAr = slugAr;
        this.metaTitleFr = metaTitleFr;
        this.metaTitleAr = metaTitleAr;
        this.tvaCategoryCode = tvaCategoryCode;
        this.channelConfig = channelConfig;
        this.position = position;
        this.active = active;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.updatedAt = updatedAt;
    }

    // ── Domain method: update ──
    public void update(String nameFr, String nameAr, String metaTitleFr, String metaTitleAr,
                       String tvaCategoryCode, Map<String, Boolean> channelConfig,
                       int position, UUID parentId) {
        boolean slugChanged = false;

        if (nameFr != null && !nameFr.equals(this.nameFr)) {
            this.nameFr = nameFr;
            var newSlug = SlugGenerator.generate(nameFr);
            slugChanged = !newSlug.equals(this.slugFr);
            this.slugFr = newSlug;
        }
        if (nameAr != null && !nameAr.equals(this.nameAr)) {
            this.nameAr = nameAr;
            this.slugAr = SlugGenerator.generateAr(nameAr);
        }
        if (metaTitleFr != null) {
            if (metaTitleFr.length() > 60) throw new IllegalArgumentException("metaTitleFr max 60 chars");
            this.metaTitleFr = metaTitleFr;
        }
        if (metaTitleAr != null) {
            if (metaTitleAr.length() > 60) throw new IllegalArgumentException("metaTitleAr max 60 chars");
            this.metaTitleAr = metaTitleAr;
        }
        if (tvaCategoryCode != null) this.tvaCategoryCode = tvaCategoryCode;
        if (channelConfig != null) this.channelConfig = new HashMap<>(channelConfig);
        this.position = position;
        this.parentId = parentId;
        this.updatedAt = LocalDateTime.now();

        this.pendingEvents.add(new CatalogCategoryDomainEvent.Updated(
                this.id.toString(), this.code, this.tenantId, slugChanged));
    }

    // ── Domain method: markDeleted ──
    // ⚠ productCount check done by SERVICE before calling this
    public void markDeleted() {
        this.active = false;
        this.pendingEvents.add(new CatalogCategoryDomainEvent.Deleted(
                this.id.toString(), this.code, this.tenantId));
    }

    // ── Drain events after service has published them ──
    public List<CatalogCategoryDomainEvent> drainPendingEvents() {
        var events = List.copyOf(pendingEvents);
        pendingEvents.clear();
        return events;
    }



    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        return id.equals(((Category) o).id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }
}
