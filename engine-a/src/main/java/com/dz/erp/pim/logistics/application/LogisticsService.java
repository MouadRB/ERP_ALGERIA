package com.dz.erp.pim.logistics.application;

import com.dz.erp.pim.logistics.application.dto.*;
import com.dz.erp.pim.logistics.domain.model.ProductLogistics;
import com.dz.erp.pim.logistics.domain.model.WilayaRestriction;
import com.dz.erp.pim.logistics.domain.port.LogisticsRepository;
import com.dz.erp.pim.logistics.domain.port.WilayaRestrictionRepository;
import com.dz.erp.pim.logistics.infrastructure.mapper.LogisticsResponseMapper;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LogisticsService {

    private final LogisticsRepository logisticsRepo;
    private final WilayaRestrictionRepository restrictionRepo;
    private final LogisticsResponseMapper mapper;

    @Transactional
    public LogisticsResponse updateLogistics(String productId, UpdateLogisticsCommand cmd) {
        var tid = AuthContext.currentTenantId();

        var logistics = logisticsRepo.findByProductId(productId, tid)
                .orElse(ProductLogistics.create(productId, tid));

        logistics.updateStockSettings(cmd.stockAlertThreshold(), cmd.reorderQuantity(),
                cmd.reorderLeadDays(), cmd.autoReorderEnabled());
        logistics.updateDimensions(cmd.weightGrams(), cmd.lengthCm(), cmd.widthCm(), cmd.heightCm());
        logistics.updatePackaging(cmd.packagingWeightGrams(), cmd.packagingType(), cmd.fragile());

        logistics = logisticsRepo.save(logistics);
        return buildResponse(productId, tid, logistics);
    }

    @Transactional
    public LogisticsResponse addRestriction(String productId, AddWilayaRestrictionCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();

        if (restrictionRepo.exists(productId, cmd.wilayaCode(), tid))
            throw new BusinessException(ErrorCode.WILAYA_ALREADY_RESTRICTED);

        var restriction = WilayaRestriction.create(productId, tid, cmd.wilayaCode(), cmd.reason(), uid);
        restrictionRepo.save(restriction);

        var logistics = logisticsRepo.findByProductId(productId, tid).orElse(null);
        return buildResponse(productId, tid, logistics);
    }

    @Transactional
    public void removeRestriction(String productId, String wilayaCode) {
        var tid = AuthContext.currentTenantId();
        restrictionRepo.delete(productId, wilayaCode, tid);
    }

    @Transactional(readOnly = true)
    public LogisticsResponse getLogistics(String productId) {
        var tid = AuthContext.currentTenantId();
        var logistics = logisticsRepo.findByProductId(productId, tid).orElse(null);
        return buildResponse(productId, tid, logistics);
    }

    @Transactional(readOnly = true)
    public List<WilayaRestrictionResponse> getRestrictions(String productId) {
        var tid = AuthContext.currentTenantId();
        return mapper.toRestrictionResponses(restrictionRepo.findByProductId(productId, tid));
    }

    private LogisticsResponse buildResponse(String productId, String tenantId, ProductLogistics logistics) {
        var restrictions = mapper.toRestrictionResponses(
                restrictionRepo.findByProductId(productId, tenantId));

        if (logistics == null) {
            var defaults = ProductLogistics.create(productId, tenantId);
            return mapper.toResponse(defaults, restrictions);
        }

        return mapper.toResponse(logistics, restrictions);
    }
}
