package com.dz.erp.mdm.wilaya.infrastructure.event;
import com.dz.erp.mdm.wilaya.domain.event.WilayaDomainEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
@Slf4j @Component
public class WilayaIntraEngineEventListener {
    @EventListener public void on(WilayaDomainEvent.Activated e) { log.info("Wilaya activated: {}", e.wilayaCode()); }
}
