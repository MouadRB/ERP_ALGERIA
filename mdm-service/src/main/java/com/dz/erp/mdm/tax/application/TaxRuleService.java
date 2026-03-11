package com.dz.erp.mdm.tax.application;

import com.dz.erp.mdm.tax.application.dto.*;
import com.dz.erp.mdm.tax.domain.event.TaxRuleDomainEvent;
import com.dz.erp.mdm.tax.domain.model.TaxRule;
import com.dz.erp.mdm.tax.domain.port.TaxRuleEventPort;
import com.dz.erp.mdm.tax.domain.port.TaxRuleRepository;
import com.dz.erp.mdm.tax.infrastructure.mapper.TaxRuleResponseMapper;
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
public class TaxRuleService {
    private final TaxRuleRepository repo;
    private final TaxRuleEventPort eventPort;
    private final TaxRuleResponseMapper mapper;

    @Transactional
    public TaxRuleResponse create(CreateTaxRuleCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        if (repo.existsByTaxRuleCode(cmd.taxRuleCode().trim().toUpperCase(), tid))
            throw new BusinessException(ErrorCode.TAX_RULE_DUPLICATE, cmd.taxRuleCode());
        var rule = TaxRule.create(cmd.taxRuleCode(), tid, cmd.categoryCode(), cmd.taxRate(),
                cmd.description(), cmd.effectiveFrom(), cmd.effectiveTo(), uid);
        rule = repo.save(rule);
        eventPort.publish("TAX_RULE_CREATED", rule.getTaxRuleCode(),
                new TaxRuleDomainEvent.Created(UUID.randomUUID().toString(), "TAX_RULE_CREATED", 1,
                        tid, "TaxRule", rule.getTaxRuleCode(), Instant.now(),
                        rule.getTaxRuleCode(), rule.getCategoryCode(), rule.getTaxRate(), uid));
        return mapper.toResponse(rule);
    }

    @Transactional
    public TaxRuleResponse activate(String code) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var rule = findOrThrow(code, tid);
        rule.activate(uid);
        // Auto-archive previous active rule for same category
        var categoryCode = rule.getCategoryCode();
        var ruleCode = rule.getTaxRuleCode();
        repo.findActiveByCategoryCode(categoryCode, tid).ifPresent(prev -> {
            if (!prev.getTaxRuleCode().equals(ruleCode)) {
                prev.archive(uid);
                repo.save(prev);
                log.info("Auto-archived previous tax rule: {}", prev.getTaxRuleCode());
            }
        });
        rule = repo.save(rule);
        eventPort.publish("TAX_RULE_ACTIVATED", rule.getTaxRuleCode(),
                new TaxRuleDomainEvent.Activated(UUID.randomUUID().toString(), "TAX_RULE_ACTIVATED", 1,
                        tid, "TaxRule", rule.getTaxRuleCode(), Instant.now(),
                        rule.getTaxRuleCode(), rule.getCategoryCode(), uid));
        return mapper.toResponse(rule);
    }

    @Transactional
    public TaxRuleResponse archive(String code) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var rule = findOrThrow(code, tid);
        rule.archive(uid);
        rule = repo.save(rule);
        eventPort.publish("TAX_RULE_ARCHIVED", rule.getTaxRuleCode(),
                new TaxRuleDomainEvent.Archived(UUID.randomUUID().toString(), "TAX_RULE_ARCHIVED", 1,
                        tid, "TaxRule", rule.getTaxRuleCode(), Instant.now(),
                        rule.getTaxRuleCode(), rule.getCategoryCode(), uid));
        return mapper.toResponse(rule);
    }

    @Transactional
    public TaxRuleResponse update(String code, UpdateTaxRuleCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var uid = AuthContext.currentUserId();
        var rule = findOrThrow(code, tid);
        rule.update(cmd.categoryCode(), cmd.taxRate(), cmd.description(), cmd.effectiveFrom(), cmd.effectiveTo(), uid);
        rule = repo.save(rule);
        eventPort.publish("TAX_RULE_UPDATED", rule.getTaxRuleCode(),
                new TaxRuleDomainEvent.Updated(UUID.randomUUID().toString(), "TAX_RULE_UPDATED", 1,
                        tid, "TaxRule", rule.getTaxRuleCode(), Instant.now(), rule.getTaxRuleCode(), uid));
        return mapper.toResponse(rule);
    }

    @Transactional(readOnly = true)
    public TaxRuleResponse getByCode(String code) {
        return mapper.toResponse(findOrThrow(code, AuthContext.currentTenantId()));
    }

    @Transactional(readOnly = true)
    public TaxRuleResponse resolve(String categoryCode) {
        return repo.findActiveByCategoryCode(categoryCode.trim().toUpperCase(), AuthContext.currentTenantId())
                .map(mapper::toResponse)
                .orElseThrow(() -> new BusinessException(ErrorCode.TAX_RULE_NO_ACTIVE_RULE, categoryCode));
    }

    @Transactional(readOnly = true)
    public Page<TaxRuleResponse> search(TaxRuleSearchQuery q) {
        return repo.search(q.categoryCode(), q.status(), AuthContext.currentTenantId(),
                PageRequest.of(q.page(), q.size(), Sort.by("createdAt").descending())).map(mapper::toResponse);
    }

    private TaxRule findOrThrow(String code, String tid) {
        return repo.findByTaxRuleCode(code, tid).orElseThrow(() -> new BusinessException(ErrorCode.TAX_RULE_NOT_FOUND, code));
    }
}
