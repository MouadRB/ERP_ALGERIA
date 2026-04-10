package com.dz.erp.pim.attribute.application;

import com.dz.erp.pim.attribute.application.dto.*;
import com.dz.erp.pim.attribute.domain.model.ProductAttribute;
import com.dz.erp.pim.attribute.infrastructure.persistence.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AttributeService {
    private final ProductAttributeSpringDataRepository repo;

    @Transactional
    public AttributeResponse add(String productId, SetAttributeCommand cmd) {
        var attr = new ProductAttribute(productId, cmd.key(), cmd.valueFr(), cmd.valueAr(), cmd.unit());
        var e = new ProductAttributeJpaEntity();
        e.setAttributeId(attr.getAttributeId());
        e.setProductId(productId);
        e.setKey(cmd.key());
        e.setValueFr(cmd.valueFr());
        e.setValueAr(cmd.valueAr());
        e.setUnit(cmd.unit());
        repo.save(e);
        return new AttributeResponse(attr.getAttributeId(), productId, cmd.key(), cmd.valueFr(), cmd.valueAr(), cmd.unit());
    }

    @Transactional(readOnly = true)
    public List<AttributeResponse> list(String productId) {
        return repo.findByProductId(productId).stream()
                .map(e -> new AttributeResponse(e.getAttributeId(), e.getProductId(), e.getKey(), e.getValueFr(), e.getValueAr(), e.getUnit())).toList();
    }

    @Transactional
    public void delete(String attributeId) {
        repo.deleteById(attributeId);
    }
}
