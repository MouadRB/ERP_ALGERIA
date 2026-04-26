package com.dz.erp.oms.integration.Api;

import com.dz.erp.oms.common.OmsApiPaths;
import com.dz.erp.oms.integration.application.ShipmentLifecycleService;
import com.dz.erp.oms.integration.infrastructure.carrier.CarrierRouter;
import com.dz.erp.shared.api.ApiResult;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Public webhook endpoint for every carrier. Security = carrier-specific signature
 * verification performed inside the verifier bean — the path is {@code permitAll} so
 * the platform doesn't reject legitimate carrier callbacks on JWT grounds.
 */
@Slf4j
@RestController
@RequestMapping(OmsApiPaths.CARRIER_WEBHOOKS)
@RequiredArgsConstructor
public class CarrierWebhookController {

    private final CarrierRouter router;
    private final ShipmentLifecycleService lifecycle;

    @PostMapping("/{carrierCode}")
    public ApiResult<Void> receive(
            @PathVariable String carrierCode,
            @RequestBody String rawBody,
            HttpServletRequest request) {

        var headers = collectHeaders(request);
        var verifier = router.verifierFor(carrierCode);
        var normalized = verifier.verifyAndNormalize(headers, rawBody);
        lifecycle.handle(normalized);
        return ApiResult.ok(null, "oms.carrier.webhook.accepted");
    }

    private Map<String, String> collectHeaders(HttpServletRequest request) {
        var names = request.getHeaderNames();
        if (names == null) return Collections.emptyMap();
        Map<String, String> out = new HashMap<>();
        while (names.hasMoreElements()) {
            var n = names.nextElement();
            out.put(n, request.getHeader(n));
        }
        return out;
    }
}
