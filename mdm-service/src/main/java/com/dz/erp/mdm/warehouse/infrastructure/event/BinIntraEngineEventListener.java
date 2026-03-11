package com.dz.erp.mdm.warehouse.infrastructure.event;
import com.dz.erp.mdm.warehouse.domain.event.BinDomainEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
@Slf4j @Component
public class BinIntraEngineEventListener {
    @EventListener public void on(BinDomainEvent.Activated e) { log.info("Bin activated: {}", e.binCode()); }
}
