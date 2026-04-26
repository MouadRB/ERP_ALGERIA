package com.dz.erp.catalog.shared.domain;

/**
 * Who performed an action. Used in the audit log to distinguish
 * human actions (USER) from automated system reactions (SYSTEM, INVENTORY, PIM).
 */
public enum ActorType {
    USER,
    SYSTEM,
    INVENTORY,
    PIM
}
