package com.dz.erp.pim.seo.application.dto;
import java.util.List;
public record UpdateSeoCommand(String slugFr, String slugAr, String metaTitleFr, String metaTitleAr, String metaDescriptionFr, String metaDescriptionAr, List<String> keywords) {}
