package com.dz.erp.pim.seo.application;

import com.dz.erp.pim.seo.application.dto.*;
import com.dz.erp.pim.seo.infrastructure.persistence.*;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SeoService {
    private final SeoSpringDataRepository repo;

    @Transactional
    public SeoResponse update(String pid, UpdateSeoCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var e = repo.findByProductIdAndTenantId(pid, tid).orElseGet(() -> {
            var n = new ProductSeoJpaEntity();
            n.setProductId(pid);
            n.setTenantId(tid);
            return n;
        });
        if (cmd.slugFr() != null) e.setSlugFr(cmd.slugFr());
        if (cmd.slugAr() != null) e.setSlugAr(cmd.slugAr());
        if (cmd.metaTitleFr() != null) e.setMetaTitleFr(cmd.metaTitleFr());
        if (cmd.metaTitleAr() != null) e.setMetaTitleAr(cmd.metaTitleAr());
        if (cmd.metaDescriptionFr() != null) e.setMetaDescriptionFr(cmd.metaDescriptionFr());
        if (cmd.metaDescriptionAr() != null) e.setMetaDescriptionAr(cmd.metaDescriptionAr());
        if (cmd.keywords() != null) e.setKeywords(cmd.keywords());
        repo.save(e);
        return new SeoResponse(pid, e.getSlugFr(), e.getSlugAr(), e.getMetaTitleFr(), e.getMetaTitleAr(), e.getMetaDescriptionFr(), e.getMetaDescriptionAr(), e.getKeywords());
    }

    @Transactional(readOnly = true)
    public SeoResponse getSeo(String pid) {
        var tid = AuthContext.currentTenantId();
        return repo.findByProductIdAndTenantId(pid, tid).map(e -> new SeoResponse(pid, e.getSlugFr(), e.getSlugAr(), e.getMetaTitleFr(), e.getMetaTitleAr(), e.getMetaDescriptionFr(), e.getMetaDescriptionAr(), e.getKeywords()))
                .orElse(new SeoResponse(pid, null, null, null, null, null, null, java.util.List.of()));
    }
}
