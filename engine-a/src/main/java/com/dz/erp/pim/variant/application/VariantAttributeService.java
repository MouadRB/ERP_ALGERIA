package com.dz.erp.pim.variant.application;

import com.dz.erp.pim.variant.application.dto.SetVariantAttributeCommand;
import com.dz.erp.pim.variant.application.dto.VariantAttributeResponse;
import com.dz.erp.pim.variant.domain.model.VariantAttribute;
import com.dz.erp.pim.variant.domain.port.VariantAttributeRepository;
import com.dz.erp.pim.variant.domain.port.VariantRepository;
import com.dz.erp.pim.variant.infrastructure.mapper.VariantAttributeResponseMapper;
import com.dz.erp.shared.exception.BusinessException;
import com.dz.erp.shared.exception.ErrorCode;
import com.dz.erp.shared.security.AuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VariantAttributeService {

    private final VariantAttributeRepository attributeRepo;
    private final VariantRepository variantRepo;
    private final VariantAttributeResponseMapper mapper;

    @Transactional
    public VariantAttributeResponse add(String variantId, SetVariantAttributeCommand cmd) {
        var tid = AuthContext.currentTenantId();
        variantRepo.findById(variantId, tid)
                .orElseThrow(() -> new BusinessException(ErrorCode.VARIANT_NOT_FOUND, variantId));

        var attribute = VariantAttribute.create(variantId, tid,
                cmd.key(), cmd.valueFr(), cmd.valueAr(), cmd.unit(), cmd.sortOrder());
        attribute = attributeRepo.save(attribute);
        return mapper.toResponse(attribute);
    }

    @Transactional
    public VariantAttributeResponse update(String attributeId, SetVariantAttributeCommand cmd) {
        var tid = AuthContext.currentTenantId();
        var attribute = attributeRepo.findById(attributeId, tid)
                .orElseThrow(() -> new BusinessException(ErrorCode.ATTRIBUTE_NOT_FOUND, attributeId));

        attribute.update(cmd.key(), cmd.valueFr(), cmd.valueAr(), cmd.unit(), cmd.sortOrder());
        attribute = attributeRepo.save(attribute);
        return mapper.toResponse(attribute);
    }

    @Transactional(readOnly = true)
    public List<VariantAttributeResponse> listByVariant(String variantId) {
        var tid = AuthContext.currentTenantId();
        return mapper.toResponses(attributeRepo.findByVariantId(variantId, tid));
    }

    @Transactional
    public void delete(String attributeId) {
        attributeRepo.delete(attributeId);
    }
}
