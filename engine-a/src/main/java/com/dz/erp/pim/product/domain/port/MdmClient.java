package com.dz.erp.pim.product.domain.port;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface MdmClient {
    record SkuInfo(String skuCode, String status, String baseUom, String productType) {
    }

    record SupplierInfo(String supplierCode, String status, String companyName) {
    }

    record TaxRateInfo(String taxRuleCode, String categoryCode, BigDecimal taxRate) {
    }

    record WilayaInfo(String wilayaCode, String name, String nameAr, boolean deliverable, int deliveryCostDzd) {
    }

    Optional<SkuInfo> validateSku(String skuCode);

    Optional<SupplierInfo> validateSupplier(String supplierCode);

    Optional<TaxRateInfo> resolveTaxRate(String categoryCode);

    List<WilayaInfo> getDeliverableWilayas();
}
