package com.dz.erp.mdm.supplier.domain.model;

import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.time.Instant;
import java.util.Objects;

@Getter
@EqualsAndHashCode(of = {"supplierCode", "tenantId"})
public class Supplier {
    private final String supplierCode;
    private final String tenantId;
    private String companyName;
    private String contactName;
    private String phone;
    private String email;
    private String address;
    private String wilayaCode;
    private String taxId;
    private int paymentTermDays;
    private SupplierStatus status;
    private String notes;
    private final String createdBy;
    private final Instant createdAt;
    private String updatedBy;
    private Instant updatedAt;
    private long version;

    public static Supplier create(String supplierCode, String tenantId, String companyName,
                                  String contactName, String phone, String email, String address,
                                  String wilayaCode, String taxId, int paymentTermDays, String notes, String createdBy) {
        return new Supplier(Objects.requireNonNull(supplierCode).trim().toUpperCase(), tenantId,
                Objects.requireNonNull(companyName), contactName, Objects.requireNonNull(phone),
                email, address, wilayaCode, taxId, paymentTermDays > 0 ? paymentTermDays : 30,
                SupplierStatus.DRAFT, notes, Objects.requireNonNull(createdBy), Instant.now(), null, null, 0);
    }

    public static Supplier reconstitute(String supplierCode, String tenantId, String companyName,
                                        String contactName, String phone, String email, String address, String wilayaCode,
                                        String taxId, int paymentTermDays, SupplierStatus status, String notes,
                                        String createdBy, Instant createdAt, String updatedBy, Instant updatedAt, long version) {
        return new Supplier(supplierCode, tenantId, companyName, contactName, phone, email,
                address, wilayaCode, taxId, paymentTermDays, status, notes,
                createdBy, createdAt, updatedBy, updatedAt, version);
    }

    private Supplier(String supplierCode, String tenantId, String companyName, String contactName,
                     String phone, String email, String address, String wilayaCode, String taxId,
                     int paymentTermDays, SupplierStatus status, String notes,
                     String createdBy, Instant createdAt, String updatedBy, Instant updatedAt, long version) {
        this.supplierCode = supplierCode;
        this.tenantId = tenantId;
        this.companyName = companyName;
        this.contactName = contactName;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.wilayaCode = wilayaCode;
        this.taxId = taxId;
        this.paymentTermDays = paymentTermDays;
        this.status = status;
        this.notes = notes;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedBy = updatedBy;
        this.updatedAt = updatedAt;
        this.version = version;
    }

    public void activate(String activatorId) {
        if (status == SupplierStatus.ACTIVE) throw new BusinessException(ErrorCode.SUPPLIER_ALREADY_ACTIVE);
        if (status != SupplierStatus.DRAFT)
            throw new BusinessException(ErrorCode.SUPPLIER_INVALID_TRANSITION, status, SupplierStatus.ACTIVE);
        if (createdBy.equals(activatorId)) throw new BusinessException(ErrorCode.SUPPLIER_SOD_VIOLATION);
        this.status = SupplierStatus.ACTIVE;
        touch(activatorId);
    }

    public void suspend(String actorId) {
        if (status == SupplierStatus.SUSPENDED) throw new BusinessException(ErrorCode.SUPPLIER_ALREADY_SUSPENDED);
        if (status != SupplierStatus.ACTIVE)
            throw new BusinessException(ErrorCode.SUPPLIER_INVALID_TRANSITION, status, SupplierStatus.SUSPENDED);
        this.status = SupplierStatus.SUSPENDED;
        touch(actorId);
    }

    public void reactivate(String actorId) {
        if (status != SupplierStatus.SUSPENDED)
            throw new BusinessException(ErrorCode.SUPPLIER_INVALID_TRANSITION, status, SupplierStatus.ACTIVE);
        this.status = SupplierStatus.ACTIVE;
        touch(actorId);
    }

    public void blacklist(String actorId) {
        if (status == SupplierStatus.BLACKLISTED) throw new BusinessException(ErrorCode.SUPPLIER_ALREADY_BLACKLISTED);
        if (status != SupplierStatus.ACTIVE && status != SupplierStatus.SUSPENDED)
            throw new BusinessException(ErrorCode.SUPPLIER_INVALID_TRANSITION, status, SupplierStatus.BLACKLISTED);
        this.status = SupplierStatus.BLACKLISTED;
        touch(actorId);
    }

    public void update(String companyName, String contactName, String phone, String email,
                       String address, String wilayaCode, String taxId, Integer paymentTermDays, String notes, String actorId) {
        if (status != SupplierStatus.DRAFT) throw new BusinessException(ErrorCode.SUPPLIER_NOT_EDITABLE);
        if (companyName != null) this.companyName = companyName;
        if (contactName != null) this.contactName = contactName;
        if (phone != null) this.phone = phone;
        if (email != null) this.email = email;
        if (address != null) this.address = address;
        if (wilayaCode != null) this.wilayaCode = wilayaCode;
        if (taxId != null) this.taxId = taxId;
        if (paymentTermDays != null) this.paymentTermDays = paymentTermDays;
        if (notes != null) this.notes = notes;
        touch(actorId);
    }

    private void touch(String actorId) {
        this.updatedBy = actorId;
        this.updatedAt = Instant.now();
    }
}
