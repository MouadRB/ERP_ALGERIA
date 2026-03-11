package com.dz.erp.mdm.supplier.infrastructure.persistence;

import com.dz.erp.mdm.supplier.domain.model.SupplierStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
@NoArgsConstructor
public class SupplierJpaEntity {
    @Id
    @Column(length = 50)
    private String supplierCode;
    @Column(nullable = false, length = 50)
    private String tenantId;
    @Column(nullable = false, length = 200)
    private String companyName;
    @Column(length = 100)
    private String contactName;
    @Column(nullable = false, length = 20)
    private String phone;
    @Column(length = 100)
    private String email;
    @Column(columnDefinition = "TEXT")
    private String address;
    @Column(length = 2)
    private String wilayaCode;
    @Column(length = 30)
    private String taxId;
    @Column(nullable = false)
    private int paymentTermDays;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SupplierStatus status;
    @Column(columnDefinition = "TEXT")
    private String notes;
    @Column(nullable = false, length = 100)
    private String createdBy;
    @Column(nullable = false)
    private Instant createdAt;
    @Column(length = 100)
    private String updatedBy;
    private Instant updatedAt;
    @Version
    private long version;
}
