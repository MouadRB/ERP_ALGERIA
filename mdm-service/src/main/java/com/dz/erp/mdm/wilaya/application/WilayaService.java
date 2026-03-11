package com.dz.erp.mdm.wilaya.application;

import com.dz.erp.mdm.wilaya.application.dto.*;
import com.dz.erp.mdm.wilaya.domain.event.WilayaDomainEvent;
import com.dz.erp.mdm.wilaya.domain.model.WilayaConfig;
import com.dz.erp.mdm.wilaya.domain.port.WilayaEventPort;
import com.dz.erp.mdm.wilaya.domain.port.WilayaRepository;
import com.dz.erp.mdm.wilaya.infrastructure.mapper.WilayaResponseMapper;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WilayaService {
    private final WilayaRepository repo;
    private final WilayaEventPort eventPort;
    private final WilayaResponseMapper mapper;

    @Transactional
    public WilayaResponse create(CreateWilayaCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        if (repo.existsByWilayaCode(cmd.wilayaCode().trim(), tid))
            throw new BusinessException(ErrorCode.WILAYA_DUPLICATE, cmd.wilayaCode());
        var w = WilayaConfig.create(cmd.wilayaCode(), tid, cmd.name(), cmd.nameAr(), cmd.zone(),
                cmd.deliveryCostDzd(), cmd.estimatedDays(), cmd.deliverable(), cmd.notes(), uid);
        w = repo.save(w);
        eventPort.publish("WILAYA_CREATED", w.getWilayaCode(),
                new WilayaDomainEvent.Created(UUID.randomUUID().toString(), "WILAYA_CREATED", 1, tid, "WilayaConfig", w.getWilayaCode(), Instant.now(), w.getWilayaCode(), w.getName(), w.getZone(), uid));
        return mapper.toResponse(w);
    }

    @Transactional
    public WilayaResponse update(String code, UpdateWilayaCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var w = findOrThrow(code, tid);
        w.update(cmd.name(), cmd.nameAr(), cmd.zone(), cmd.deliveryCostDzd(), cmd.estimatedDays(), cmd.deliverable(), cmd.notes(), uid);
        w = repo.save(w);
        eventPort.publish("WILAYA_UPDATED", w.getWilayaCode(),
                new WilayaDomainEvent.Updated(UUID.randomUUID().toString(), "WILAYA_UPDATED", 1, tid, "WilayaConfig", w.getWilayaCode(), Instant.now(), w.getWilayaCode(), uid));
        return mapper.toResponse(w);
    }

    @Transactional
    public WilayaResponse activate(String code) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var w = findOrThrow(code, tid);
        w.activate(uid);
        w = repo.save(w);
        eventPort.publish("WILAYA_ACTIVATED", w.getWilayaCode(),
                new WilayaDomainEvent.Activated(UUID.randomUUID().toString(), "WILAYA_ACTIVATED", 1, tid, "WilayaConfig", w.getWilayaCode(), Instant.now(), w.getWilayaCode(), uid));
        return mapper.toResponse(w);
    }

    @Transactional
    public WilayaResponse deactivate(String code) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var w = findOrThrow(code, tid);
        w.deactivate(uid);
        w = repo.save(w);
        eventPort.publish("WILAYA_DEACTIVATED", w.getWilayaCode(),
                new WilayaDomainEvent.Deactivated(UUID.randomUUID().toString(), "WILAYA_DEACTIVATED", 1, tid, "WilayaConfig", w.getWilayaCode(), Instant.now(), w.getWilayaCode(), uid));
        return mapper.toResponse(w);
    }

    @Transactional
    public WilayaResponse reactivate(String code) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var w = findOrThrow(code, tid);
        w.reactivate(uid);
        w = repo.save(w);
        eventPort.publish("WILAYA_REACTIVATED", w.getWilayaCode(),
                new WilayaDomainEvent.Reactivated(UUID.randomUUID().toString(), "WILAYA_REACTIVATED", 1, tid, "WilayaConfig", w.getWilayaCode(), Instant.now(), w.getWilayaCode(), uid));
        return mapper.toResponse(w);
    }

    @Transactional(readOnly = true)
    public WilayaResponse getByCode(String code) {
        return mapper.toResponse(findOrThrow(code, AuthContext.currentTenantId()));
    }

    @Transactional(readOnly = true)
    public List<WilayaResponse> findDeliverable() {
        return repo.findDeliverable(AuthContext.currentTenantId()).stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Page<WilayaResponse> search(WilayaSearchQuery q) {
        return repo.search(q.zone(), q.deliverable(), q.status(), AuthContext.currentTenantId(),
                PageRequest.of(q.page(), q.size(), Sort.by("wilayaCode").ascending())).map(mapper::toResponse);
    }

    private WilayaConfig findOrThrow(String code, String tid) {
        return repo.findByWilayaCode(code, tid).orElseThrow(() -> new BusinessException(ErrorCode.WILAYA_NOT_FOUND, code));
    }
}
