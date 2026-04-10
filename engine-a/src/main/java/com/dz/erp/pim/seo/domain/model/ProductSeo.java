package com.dz.erp.pim.seo.domain.model;

import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@Getter
public class ProductSeo {
    private final String productId;
    private final String tenantId;
    private String slugFr;
    private String slugAr;
    private String metaTitleFr;
    private String metaTitleAr;
    private String metaDescriptionFr;
    private String metaDescriptionAr;
    private List<String> keywords;
    private long version;

    public ProductSeo(String productId, String tenantId) {
        this.productId = productId;
        this.tenantId = tenantId;
        this.keywords = new ArrayList<>();
    }
}
