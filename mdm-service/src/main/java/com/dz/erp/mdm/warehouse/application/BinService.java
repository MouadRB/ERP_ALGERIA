package com.dz.erp.mdm.warehouse.application;

import com.dz.erp.mdm.warehouse.application.dto.*;
import com.dz.erp.mdm.warehouse.domain.event.BinDomainEvent;
import com.dz.erp.mdm.warehouse.domain.model.BinLocation;
import com.dz.erp.mdm.warehouse.domain.model.BinType;
import com.dz.erp.mdm.warehouse.domain.port.BinEventPort;
import com.dz.erp.mdm.warehouse.domain.port.BinRepository;
import com.dz.erp.mdm.warehouse.infrastructure.mapper.BinResponseMapper;
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
public class BinService {
    private final BinRepository repo;
    private final BinEventPort eventPort;
    private final BinResponseMapper mapper;

    @Transactional
    public BinResponse create(CreateBinCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        if (repo.existsByBinCode(cmd.binCode().trim().toUpperCase(), tid))
            throw new BusinessException(ErrorCode.BIN_DUPLICATE, cmd.binCode());
        var bin = BinLocation.create(cmd.binCode(), tid, cmd.zone(), cmd.rack(), cmd.shelf(),
                cmd.maxCapacity(), cmd.binType() != null ? BinType.valueOf(cmd.binType()) : BinType.STANDARD, cmd.notes(), uid);
        bin = repo.save(bin);
        eventPort.publish("BIN_CREATED", bin.getBinCode(),
                new BinDomainEvent.Created(UUID.randomUUID().toString(), "BIN_CREATED", 1, tid, "BinLocation", bin.getBinCode(), Instant.now(), bin.getBinCode(), bin.getZone(), bin.getBinType().name(), uid));
        return mapper.toResponse(bin);
    }

    @Transactional
    public BinResponse update(String code, UpdateBinCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var bin = findOrThrow(code, tid);
        bin.update(cmd.zone(), cmd.rack(), cmd.shelf(), cmd.maxCapacity(), cmd.binType() != null ? BinType.valueOf(cmd.binType()) : null, cmd.notes(), uid);
        bin = repo.save(bin);
        eventPort.publish("BIN_UPDATED", bin.getBinCode(),
                new BinDomainEvent.Updated(UUID.randomUUID().toString(), "BIN_UPDATED", 1, tid, "BinLocation", bin.getBinCode(), Instant.now(), bin.getBinCode(), uid));
        return mapper.toResponse(bin);
    }

    @Transactional
    public BinResponse activate(String code) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var bin = findOrThrow(code, tid);
        bin.activate(uid);
        bin = repo.save(bin);
        eventPort.publish("BIN_ACTIVATED", bin.getBinCode(),
                new BinDomainEvent.Activated(UUID.randomUUID().toString(), "BIN_ACTIVATED", 1, tid, "BinLocation", bin.getBinCode(), Instant.now(), bin.getBinCode(), uid));
        return mapper.toResponse(bin);
    }

    @Transactional
    public BinResponse deactivate(String code) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var bin = findOrThrow(code, tid);
        bin.deactivate(uid);
        bin = repo.save(bin);
        eventPort.publish("BIN_DEACTIVATED", bin.getBinCode(),
                new BinDomainEvent.Deactivated(UUID.randomUUID().toString(), "BIN_DEACTIVATED", 1, tid, "BinLocation", bin.getBinCode(), Instant.now(), bin.getBinCode(), uid));
        return mapper.toResponse(bin);
    }

    @Transactional
    public BinResponse reactivate(String code) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var bin = findOrThrow(code, tid);
        bin.reactivate(uid);
        bin = repo.save(bin);
        eventPort.publish("BIN_REACTIVATED", bin.getBinCode(),
                new BinDomainEvent.Reactivated(UUID.randomUUID().toString(), "BIN_REACTIVATED", 1, tid, "BinLocation", bin.getBinCode(), Instant.now(), bin.getBinCode(), uid));
        return mapper.toResponse(bin);
    }

    @Transactional(readOnly = true)
    public BinResponse getByCode(String code) {
        return mapper.toResponse(findOrThrow(code, AuthContext.currentTenantId()));
    }

    @Transactional(readOnly = true)
    public List<BinResponse> findAvailable(String zone) {
        return repo.findAvailable(zone, AuthContext.currentTenantId()).stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Page<BinResponse> search(BinSearchQuery q) {
        return repo.search(q.zone(), q.binType(), q.status(), AuthContext.currentTenantId(),
                PageRequest.of(q.page(), q.size(), Sort.by("binCode").ascending())).map(mapper::toResponse);
    }

    private BinLocation findOrThrow(String code, String tid) {
        return repo.findByBinCode(code, tid).orElseThrow(() -> new BusinessException(ErrorCode.BIN_NOT_FOUND, code));
    }
}
