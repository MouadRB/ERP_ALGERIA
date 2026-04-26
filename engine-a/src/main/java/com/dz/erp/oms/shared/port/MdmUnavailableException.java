package com.dz.erp.oms.shared.port;

/**
 * Signals that an MDM lookup could not be completed because the MDM service is
 * unreachable (timeout, circuit-open, 5xx). Callers treat this as
 * <em>"unknown"</em> rather than <em>"invalid"</em>.
 */
public class MdmUnavailableException extends RuntimeException {

    public MdmUnavailableException(String message) {
        super(message);
    }

    public MdmUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
