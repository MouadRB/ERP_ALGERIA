package com.dz.erp.pim.pricing.application;

import com.dz.erp.pim.pricing.application.dto.*;
import com.dz.erp.pim.pricing.domain.model.*;
import com.dz.erp.pim.pricing.infrastructure.mapper.*;
import com.dz.erp.pim.pricing.infrastructure.persistence.*;
import com.dz.erp.pim.product.domain.port.MdmClient;
import com.dz.erp.pim.product.domain.port.ProductRepository;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;


@Slf4j
@Service
@RequiredArgsConstructor
public class PricingService {
    private final ProductRepository productRepo;
    private final PriceSpringDataRepository priceRepo;
    private final PriceHistorySpringDataRepository historyRepo;
    private final PricePersistenceMapper priceMapper;
    private final PriceHistoryPersistenceMapper historyMapper;
    private final MdmClient mdmClient;

    @Transactional
    public PriceResponse setPrice(String productId, SetPriceCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var taxInfo = mdmClient.resolveTaxRate(cmd.categoryCode() != null ? cmd.categoryCode() : "GENERAL")
                .orElseThrow(() -> new BusinessException(ErrorCode.PRICE_TAX_RULE_NOT_FOUND, cmd.categoryCode()));
        var existing = priceRepo.findByProductIdAndTenantId(productId, tid);
        ProductPrice price;
        if (existing.isPresent()) {
            price = priceMapper.toDomain(existing.get());
            var oldTtc = price.getPriceTtc();
            price.setPrice(cmd.priceTtc(), taxInfo.taxRate(), taxInfo.taxRuleCode(), uid);
            historyRepo.save(historyMapper.toJpa(new PriceHistory(productId, tid, "PRICE_MODIFIED", oldTtc, cmd.priceTtc(), uid)));
        } else {
            price = ProductPrice.create(productId, tid, cmd.priceTtc(), taxInfo.taxRate(), taxInfo.taxRuleCode(), uid);
            historyRepo.save(historyMapper.toJpa(new PriceHistory(productId, tid, "INITIAL", null, cmd.priceTtc(), uid)));
        }
        var saved = priceRepo.save(priceMapper.toJpa(price));
        return toResponse(priceMapper.toDomain(saved));
    }

    @Transactional(readOnly = true)
    public PriceResponse getPrice(String productId) {
        return priceRepo.findByProductIdAndTenantId(productId, AuthContext.currentTenantId())
                .map(e -> toResponse(priceMapper.toDomain(e))).orElseThrow(() -> new BusinessException(ErrorCode.PRICE_NOT_SET, productId));
    }

    @Transactional(readOnly = true)
    public List<PriceHistoryResponse> getHistory(String productId) {
        return historyRepo.findByProductIdAndTenantIdOrderByChangedAtDesc(productId, AuthContext.currentTenantId()).stream()
                .map(e -> new PriceHistoryResponse(e.getHistoryId(), e.getChangeType(), e.getOldValue(), e.getNewValue(), e.getCurrency(), e.getChangedBy(), e.getChangedAt())).toList();
    }

    private PriceResponse toResponse(ProductPrice p) {
        return new PriceResponse(p.getProductId(), p.getPriceTtc(), p.getPriceHt(), p.getTaxRate(), p.getTvaAmount(), p.getTaxRuleCode(), p.getCostFifo(), p.getCostWeightedAvg(), p.getLastPurchaseOrderRef(), p.getMarginAmount(), p.getMarginPercent(), p.getUpdatedBy(), p.getUpdatedAt());
    }


    @Transactional
    public void updateCostFromProcurement(String skuCode, String tenantId,
                                          BigDecimal fifoCost, BigDecimal weightedAvg, String poRef) {
        // Find product by SKU (Procurement doesn't know productId)
        var product = productRepo.findBySkuCode(skuCode, tenantId).orElse(null);
        if (product == null) {
            log.warn("Cost update ignored — no product found for SKU {} in tenant {}", skuCode, tenantId);
            return;
        }
        var productId = product.getProductId();
        var existing = priceRepo.findByProductIdAndTenantId(productId, tenantId);
        if (existing.isPresent()) {
            var price = priceMapper.toDomain(existing.get());
            var oldCost = price.getCostFifo();
            // Update cost — domain recalculates margin automatically
            price.updateCost(fifoCost, weightedAvg, poRef);
            priceRepo.save(priceMapper.toJpa(price));
            historyRepo.save(historyMapper.toJpa(new PriceHistory(
                    productId, tenantId, "COST_UPDATED", oldCost, fifoCost,
                    "Système (Réception " + poRef + ")")));
        } else {
            var entity = new ProductPriceJpaEntity();
            entity.setProductId(productId);
            entity.setTenantId(tenantId);
            entity.setCostFifo(fifoCost);
            entity.setCostWeightedAvg(weightedAvg);
            entity.setLastPurchaseOrderRef(poRef);
            priceRepo.save(entity);

            historyRepo.save(historyMapper.toJpa(new PriceHistory(
                    productId, tenantId, "INITIAL_COST", null, fifoCost,
                    "Système (Réception " + poRef + ")")));


        }
    }
}
