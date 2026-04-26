package com.dz.erp.inventory.alert.application.service;

import com.dz.erp.inventory.alert.application.dto.StockAlertResponse;
import com.dz.erp.inventory.alert.domain.model.StockAlert;
import com.dz.erp.inventory.alert.domain.port.StockAlertRepository;
import com.dz.erp.inventory.alert.infrastructure.mapper.StockAlertResponseMapper;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockAlertService {
    private final StockAlertRepository alertRepo;
    private final StockAlertResponseMapper responseMapper;

    @Transactional(readOnly = true)
    public List<StockAlertResponse> getActiveAlerts() {
        var tid = AuthContext.currentTenantId();
        return alertRepo.findActive(tid).stream().map(responseMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<StockAlertResponse> getReorderSuggestions() {
        var tid = AuthContext.currentTenantId();
        return alertRepo.findActive(tid).stream()
                .filter(a -> a.getSuggestedQuantity() != null && a.getSuggestedQuantity() > 0)
                .map(responseMapper::toResponse)
                .toList();
    }

    @Transactional
    public StockAlertResponse resolve(String alertId) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var alert = alertRepo.findById(alertId, tid)
                .orElseThrow(() -> new BusinessException(ErrorCode.ALERT_NOT_FOUND));
        alert.resolve(uid);
        alert = alertRepo.save(alert);
        return responseMapper.toResponse(alert);
    }
}
