package com.dz.erp.mdm.supplier.application;

import com.dz.erp.mdm.supplier.application.dto.*;
import com.dz.erp.mdm.supplier.domain.event.SupplierDomainEvent;
import com.dz.erp.mdm.supplier.domain.model.Supplier;
import com.dz.erp.mdm.supplier.domain.port.SupplierEventPort;
import com.dz.erp.mdm.supplier.domain.port.SupplierRepository;
import com.dz.erp.mdm.supplier.infrastructure.mapper.SupplierResponseMapper;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupplierService {
    private final SupplierRepository supplierRepository;
    private final SupplierEventPort eventPort;
    private final SupplierResponseMapper mapper;

    @Transactional
    public SupplierResponse register(RegisterSupplierCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        if (supplierRepository.existsBySupplierCode(cmd.supplierCode().trim().toUpperCase(), tid))
            throw new BusinessException(ErrorCode.SUPPLIER_DUPLICATE, cmd.supplierCode());
        var s = Supplier.create(cmd.supplierCode(), tid, cmd.companyName(), cmd.contactName(),
                cmd.phone(), cmd.email(), cmd.address(), cmd.wilayaCode(), cmd.taxId(),
                cmd.paymentTermDays() != null ? cmd.paymentTermDays() : 30, cmd.notes(), uid);
        s = supplierRepository.save(s);
        eventPort.publish("SUPPLIER_REGISTERED", s.getSupplierCode(),
                new SupplierDomainEvent.Registered(UUID.randomUUID().toString(), "SUPPLIER_REGISTERED", 1,
                        tid, "Supplier", s.getSupplierCode(), Instant.now(),
                        s.getSupplierCode(), s.getCompanyName(), s.getWilayaCode(), uid));
        return mapper.toResponse(s);
    }

    @Transactional
    public SupplierResponse update(String code, UpdateSupplierCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var s = findOrThrow(code, tid);
        s.update(cmd.companyName(), cmd.contactName(), cmd.phone(), cmd.email(),
                cmd.address(), cmd.wilayaCode(), cmd.taxId(), cmd.paymentTermDays(), cmd.notes(), uid);
        s = supplierRepository.save(s);
        eventPort.publish("SUPPLIER_UPDATED", s.getSupplierCode(),
                new SupplierDomainEvent.Updated(UUID.randomUUID().toString(), "SUPPLIER_UPDATED", 1,
                        tid, "Supplier", s.getSupplierCode(), Instant.now(), s.getSupplierCode(), uid));
        return mapper.toResponse(s);
    }

    @Transactional
    public SupplierResponse activate(String code) {
        return lifecycle(code, "activate");
    }

    @Transactional
    public SupplierResponse suspend(String code) {
        return lifecycle(code, "suspend");
    }

    @Transactional
    public SupplierResponse reactivate(String code) {
        return lifecycle(code, "reactivate");
    }

    @Transactional
    public SupplierResponse blacklist(String code) {
        return lifecycle(code, "blacklist");
    }

    private SupplierResponse lifecycle(String code, String action) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var s = findOrThrow(code, tid);
        switch (action) {
            case "activate" -> s.activate(uid);
            case "suspend" -> s.suspend(uid);
            case "reactivate" -> s.reactivate(uid);
            case "blacklist" -> s.blacklist(uid);
        }
        s = supplierRepository.save(s);
        var eventType = "SUPPLIER_" + action.toUpperCase() + (action.equals("blacklist") ? "ED" : action.endsWith("e") ? "D" : "ED");
        eventPort.publish(eventType, s.getSupplierCode(), switch (action) {
            case "activate" ->
                    new SupplierDomainEvent.Activated(UUID.randomUUID().toString(), eventType, 1, tid, "Supplier", s.getSupplierCode(), Instant.now(), s.getSupplierCode(), uid);
            case "suspend" ->
                    new SupplierDomainEvent.Suspended(UUID.randomUUID().toString(), eventType, 1, tid, "Supplier", s.getSupplierCode(), Instant.now(), s.getSupplierCode(), uid);
            case "reactivate" ->
                    new SupplierDomainEvent.Reactivated(UUID.randomUUID().toString(), eventType, 1, tid, "Supplier", s.getSupplierCode(), Instant.now(), s.getSupplierCode(), uid);
            case "blacklist" ->
                    new SupplierDomainEvent.Blacklisted(UUID.randomUUID().toString(), eventType, 1, tid, "Supplier", s.getSupplierCode(), Instant.now(), s.getSupplierCode(), uid);
            default -> throw new IllegalArgumentException(action);
        });
        return mapper.toResponse(s);
    }

    @Transactional(readOnly = true)
    public SupplierResponse getByCode(String code) {
        return mapper.toResponse(findOrThrow(code, AuthContext.currentTenantId()));
    }

    @Transactional(readOnly = true)
    public Page<SupplierResponse> search(SupplierSearchQuery q) {
        return supplierRepository.search(q.searchTerm(), q.status(), q.wilayaCode(),
                        AuthContext.currentTenantId(), PageRequest.of(q.page(), q.size(), Sort.by("createdAt").descending()))
                .map(mapper::toResponse);
    }

    private Supplier findOrThrow(String code, String tid) {
        return supplierRepository.findBySupplierCode(code, tid).orElseThrow(() -> new BusinessException(ErrorCode.SUPPLIER_NOT_FOUND, code));
    }
}
