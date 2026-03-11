package com.dz.erp.mdm.supplier.infrastructure.event;
import com.dz.erp.mdm.supplier.domain.event.SupplierDomainEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
@Slf4j @Component
public class SupplierIntraEngineEventListener {
    @EventListener public void on(SupplierDomainEvent.Registered e) { log.info("Supplier registered: {}", e.supplierCode()); }
    @EventListener public void on(SupplierDomainEvent.Activated e) { log.info("Supplier activated: {}", e.supplierCode()); }
}
