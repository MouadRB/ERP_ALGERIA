package com.dz.erp.oms.shared.integration.mdm;

import com.dz.erp.oms.shared.port.MdmAddressPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@ConditionalOnProperty(prefix = "oms.mdm", name = "mode", havingValue = "stub", matchIfMissing = true)
public class MdmAddressStubAdapter implements MdmAddressPort {

    private static final int MIN_WILAYA = 1;
    private static final int MAX_WILAYA = 58;

    @Override
    public boolean isWilayaSupported(String tenantId, String wilayaCode) {
        if (wilayaCode == null || wilayaCode.length() != 2) return false;
        try {
            int code = Integer.parseInt(wilayaCode);
            return code >= MIN_WILAYA && code <= MAX_WILAYA;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}
