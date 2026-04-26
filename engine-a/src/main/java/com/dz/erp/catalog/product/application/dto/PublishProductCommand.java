package com.dz.erp.catalog.product.application.dto;
import com.dz.erp.catalog.shared.domain.ChannelType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.Set;
public record PublishProductCommand(@NotBlank String skuCode, @NotEmpty Set<ChannelType> channels) {}
