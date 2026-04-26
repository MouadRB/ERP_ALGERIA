package com.dz.erp.catalog.product.infrastructure.persistence;

import com.dz.erp.catalog.product.domain.model.CatalogProduct;
import com.dz.erp.catalog.product.domain.port.CatalogProductRepository;
import com.dz.erp.catalog.product.domain.port.CatalogSearchCriteria;
import com.dz.erp.catalog.product.infrastructure.mapper.CatalogProductPersistenceMapper;
import com.dz.erp.catalog.shared.domain.ChannelType;
import com.dz.erp.catalog.shared.domain.PublicationStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CatalogProductRepositoryAdapter implements CatalogProductRepository {

    private final CatalogProductSpringDataRepository jpa;
    private final CatalogProductPersistenceMapper mapper;

    @Override
    public Optional<CatalogProduct> findBySkuCodeAndTenantId(String sku, String tid) {
        return jpa.findBySkuCodeAndTenantId(sku, tid).map(mapper::toDomain);
    }

    @Override
    public Optional<CatalogProduct> findByIdAndTenantId(UUID id, String tid) {
        return jpa.findByIdAndTenantId(id, tid).map(mapper::toDomain);
    }

    @Override
    public List<CatalogProduct> findAllByStatusAndTenantId(PublicationStatus s, String tid) {
        return jpa.findByPublicationStatusAndTenantId(s, tid).stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<CatalogProduct> findAllByCategoryIdAndTenantId(UUID catId, String tid) {
        return jpa.findByCategoryIdAndTenantId(catId, tid).stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<CatalogProduct> findPublishedByChannelAndTenantId(ChannelType channel, String tid) {
        var entities = switch (channel) {
            case WHATSAPP -> jpa.findPublishedWhatsappByTenantId(tid);
            case WEB -> jpa.findPublishedWebByTenantId(tid);
            case MARKETPLACE -> jpa.findPublishedMarketplaceByTenantId(tid);
        };
        return entities.stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<CatalogProduct> findScheduledBefore(LocalDateTime cutoff, String tid) {
        return jpa.findScheduledBefore(cutoff, tid).stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<CatalogProduct> findAutoUnpublishBefore(LocalDateTime cutoff, String tid) {
        return jpa.findAutoUnpublishBefore(cutoff, tid).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Page<CatalogProduct> search(CatalogSearchCriteria criteria, Pageable pageable) {
        return jpa.findAll((root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            predicates.add(cb.equal(root.get("tenantId"), criteria.tenantId()));
            if (criteria.status() != null) predicates.add(cb.equal(root.get("publicationStatus"), criteria.status()));
            if (criteria.categoryId() != null) predicates.add(cb.equal(root.get("categoryId"), criteria.categoryId()));
            if (criteria.channel() != null) {
                String col = switch (criteria.channel()) {
                    case WEB -> "channelWeb";
                    case WHATSAPP -> "channelWhatsapp";
                    case MARKETPLACE -> "channelMarketplace";
                };
                predicates.add(cb.isTrue(root.get(col)));
            }
            if (criteria.keyword() != null && !criteria.keyword().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("skuCode")), "%" + criteria.keyword().toLowerCase() + "%"));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        }, pageable).map(mapper::toDomain);
    }

    @Override
    public CatalogProduct save(CatalogProduct p) {
        return mapper.toDomain(jpa.save(mapper.toJpa(p)));
    }

    @Override
    public void deleteBySkuCodeAndTenantId(String sku, String tid) {
        jpa.findBySkuCodeAndTenantId(sku, tid).ifPresent(jpa::delete);
    }

    @Override
    public long countByCategoryIdAndTenantId(UUID catId, String tid) {
        return jpa.countByCategoryIdAndTenantId(catId, tid);
    }

    @Override
    public long countByCategoryIdAndStatusAndTenantId(UUID catId, PublicationStatus s, String tid) {
        return jpa.countByCategoryIdAndPublicationStatusAndTenantId(catId, s, tid);
    }

    @Override
    public long countByStatusAndTenantId(PublicationStatus s, String tid) {
        return jpa.countByPublicationStatusAndTenantId(s, tid);
    }
}
