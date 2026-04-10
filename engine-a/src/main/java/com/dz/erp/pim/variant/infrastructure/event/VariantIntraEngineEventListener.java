package com.dz.erp.pim.variant.infrastructure.event;

import com.dz.erp.pim.variant.domain.event.VariantDomainEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class VariantIntraEngineEventListener {
    @EventListener
    public void on(VariantDomainEvent.Created e) {
        log.info("PIM: Variant created {} (SKU: {})", e.variantId(), e.skuCode());
    }
}
