export const ROLES = [
  'SUPERADMIN',
  'FINANCE_DIRECTOR',
  'PRODUCT_MANAGER',
  'INVENTORY_MANAGER',
  'OMS_OPERATOR',
  'CRM_AGENT',
  'PROCUREMENT_MANAGER',
  'CATALOGUE_MANAGER',
  'ANALYST',
] as const;

export type Role = (typeof ROLES)[number];