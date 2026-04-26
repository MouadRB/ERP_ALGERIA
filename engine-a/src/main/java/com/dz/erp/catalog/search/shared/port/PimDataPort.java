package com.dz.erp.catalog.search.shared.port;

import com.dz.erp.catalog.search.shared.port.dto.PimSnapshots.*;

import java.util.List;

/**
 * Domain port — Catalog defines what it needs from PIM.
 * Infrastructure implementation (PimRestClient) calls PIM REST endpoints.
 *
 * All methods forward the JWT token for authentication.
 * Catalog never imports PIM's own response classes.
 */
public interface PimDataPort {

    PimProductSnapshot getProduct(String skuCode, String token);

    List<PimVariantSnapshot> getVariants(String skuCode, String token);

    PimPricingSnapshot getPricing(String skuCode, String token);

    List<PimAttributeSnapshot> getAttributes(String skuCode, String token);

    PimSeoSnapshot getSeo(String skuCode, String token);

    List<PimMediaSnapshot> getMedia(String skuCode, String token);
}
