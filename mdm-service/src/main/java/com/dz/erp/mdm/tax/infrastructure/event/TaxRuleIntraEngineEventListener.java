package com.dz.erp.mdm.tax.infrastructure.event;
import com.dz.erp.mdm.tax.domain.event.TaxRuleDomainEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
@Slf4j @Component
public class TaxRuleIntraEngineEventListener {
    @EventListener public void on(TaxRuleDomainEvent.Activated e) { log.info("Tax rule activated: {} for {}", e.taxRuleCode(), e.categoryCode()); }
}
