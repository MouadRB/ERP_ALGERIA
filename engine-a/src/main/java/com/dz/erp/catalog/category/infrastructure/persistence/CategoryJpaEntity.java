package com.dz.erp.catalog.category.infrastructure.persistence;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(schema = "catalog_schema", name = "categories",
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_cat_tenant_code", columnNames = {"tenant_id", "code"}),
           @UniqueConstraint(name = "uk_cat_slug_fr", columnNames = {"tenant_id", "slug_fr"}),
           @UniqueConstraint(name = "uk_cat_slug_ar", columnNames = {"tenant_id", "slug_ar"})
       })
public class CategoryJpaEntity {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Column(name = "parent_id", columnDefinition = "uuid")
    private UUID parentId;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(name = "name_fr", nullable = false, length = 255)
    private String nameFr;

    @Column(name = "name_ar", length = 255)
    private String nameAr;

    @Column(name = "slug_fr", nullable = false, length = 255)
    private String slugFr;

    @Column(name = "slug_ar", length = 255)
    private String slugAr;

    @Column(name = "meta_title_fr", length = 60)
    private String metaTitleFr;

    @Column(name = "meta_title_ar", length = 60)
    private String metaTitleAr;

    @Column(name = "tva_category_code", length = 50)
    private String tvaCategoryCode;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "channel_config", columnDefinition = "jsonb")
    private String channelConfigJson;

    @Column(nullable = false)
    private int position;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false, updatable = false, length = 100)
    private String createdBy;

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

    // ── Getters & Setters (no business logic) ──
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public UUID getParentId() { return parentId; }
    public void setParentId(UUID parentId) { this.parentId = parentId; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getNameFr() { return nameFr; }
    public void setNameFr(String nameFr) { this.nameFr = nameFr; }
    public String getNameAr() { return nameAr; }
    public void setNameAr(String nameAr) { this.nameAr = nameAr; }
    public String getSlugFr() { return slugFr; }
    public void setSlugFr(String slugFr) { this.slugFr = slugFr; }
    public String getSlugAr() { return slugAr; }
    public void setSlugAr(String slugAr) { this.slugAr = slugAr; }
    public String getMetaTitleFr() { return metaTitleFr; }
    public void setMetaTitleFr(String metaTitleFr) { this.metaTitleFr = metaTitleFr; }
    public String getMetaTitleAr() { return metaTitleAr; }
    public void setMetaTitleAr(String metaTitleAr) { this.metaTitleAr = metaTitleAr; }
    public String getTvaCategoryCode() { return tvaCategoryCode; }
    public void setTvaCategoryCode(String tvaCategoryCode) { this.tvaCategoryCode = tvaCategoryCode; }
    public String getChannelConfigJson() { return channelConfigJson; }
    public void setChannelConfigJson(String channelConfigJson) { this.channelConfigJson = channelConfigJson; }
    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
