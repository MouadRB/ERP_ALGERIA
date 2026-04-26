package com.dz.erp.catalog.product.domain.port;

import com.dz.erp.catalog.search.domain.model.CatalogProductIndexDocument;

import java.util.List;

/**
 * Domain port for uploading published products to the sales website.
 * Replace the default implementation with your own when the website is ready.
 */
public interface WebsiteUploadPort {

    /**
     * Upload a single product to the website.
     * @return true if upload succeeded
     */
    boolean upload(CatalogProductIndexDocument product);

    /**
     * Upload a batch of products to the website.
     * @return number of successfully uploaded products
     */
    int bulkUpload(List<CatalogProductIndexDocument> products);

    /**
     * Remove a product from the website (e.g. when masked or discontinued).
     * @return true if removal succeeded
     */
    boolean remove(String skuCode, String tenantId);
}
