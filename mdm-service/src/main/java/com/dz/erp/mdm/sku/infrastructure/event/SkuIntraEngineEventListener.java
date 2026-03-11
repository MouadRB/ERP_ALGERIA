package com.dz.erp.mdm.sku.infrastructure.event;

import com.dz.erp.mdm.sku.domain.event.SkuDomainEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SkuIntraEngineEventListener {
    @EventListener
    public void on(SkuDomainEvent.Registered e) {
        log.info("Intra-engine: SKU registered {}", e.skuCode());
    }

    @EventListener
    public void on(SkuDomainEvent.Activated e) {
        log.info("Intra-engine: SKU activated {}", e.skuCode());
    }
}
