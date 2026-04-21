package com.dz.erp.catalog.search.shared.port;

import java.util.List;

/**
 * Domain port — Catalog defines what it needs from MDM.
 * Infrastructure calls MDM REST endpoints: GET /mdm/v1/wilayas/deliverable
 */
public interface MdmDataPort {

    /** Returns wilaya codes where delivery is available. */
    List<String> getDeliverableWilayaCodes(String token);
}
