import type { Role } from '@ferza/shared';

type ModuleKey =
  | 'dashboard'
  | 'oms'
  | 'pim'
  | 'catalogue'
  | 'inventory'
  | 'crm'
  | 'procurement'
  | 'rapports'
  | 'parametres';

/**
 * Which roles can READ each module.
 * SUPERADMIN has access to everything.
 */
const MODULE_READ_ROLES: Record<ModuleKey, Role[]> = {
  dashboard: ['SUPERADMIN', 'FINANCE_DIRECTOR', 'PRODUCT_MANAGER', 'INVENTORY_MANAGER', 'OMS_OPERATOR', 'CRM_AGENT', 'PROCUREMENT_MANAGER', 'CATALOGUE_MANAGER', 'ANALYST'],
  oms: ['SUPERADMIN', 'OMS_OPERATOR', 'ANALYST'],
  pim: ['SUPERADMIN', 'PRODUCT_MANAGER', 'CATALOGUE_MANAGER', 'ANALYST'],
  catalogue: ['SUPERADMIN', 'CATALOGUE_MANAGER', 'PRODUCT_MANAGER', 'ANALYST'],
  inventory: ['SUPERADMIN', 'INVENTORY_MANAGER', 'ANALYST'],
  crm: ['SUPERADMIN', 'CRM_AGENT', 'ANALYST'],
  procurement: ['SUPERADMIN', 'PROCUREMENT_MANAGER', 'FINANCE_DIRECTOR', 'ANALYST'],
  rapports: ['SUPERADMIN', 'FINANCE_DIRECTOR', 'ANALYST'],
  parametres: ['SUPERADMIN'],
};

/**
 * Which roles can perform WRITE actions per module.
 */
const MODULE_WRITE_ROLES: Record<ModuleKey, Role[]> = {
  dashboard: [],
  oms: ['SUPERADMIN', 'OMS_OPERATOR'],
  pim: ['SUPERADMIN', 'PRODUCT_MANAGER'],
  catalogue: ['SUPERADMIN', 'CATALOGUE_MANAGER'],
  inventory: ['SUPERADMIN', 'INVENTORY_MANAGER'],
  crm: ['SUPERADMIN', 'CRM_AGENT'],
  procurement: ['SUPERADMIN', 'PROCUREMENT_MANAGER'],
  rapports: [],
  parametres: ['SUPERADMIN'],
};

/**
 * Only SUPERADMIN and FINANCE_DIRECTOR can approve BCs.
 * Used to conditionally render the Approve button.
 */
export const BC_APPROBATION_ROLES: Role[] = ['SUPERADMIN', 'FINANCE_DIRECTOR'];

export const canRead = (role: Role, module: ModuleKey): boolean =>
  role === 'SUPERADMIN' || MODULE_READ_ROLES[module].includes(role);

export const canWrite = (role: Role, module: ModuleKey): boolean =>
  role === 'SUPERADMIN' || MODULE_WRITE_ROLES[module].includes(role);

export const canApproveBC = (role: Role): boolean =>
  BC_APPROBATION_ROLES.includes(role);

/**
 * SoD check: returns true if the current user is NOT the BC creator.
 * Used to conditionally enable the Approve button.
 */
export const passesSOD = (currentUserId: string, bcCreatedBy: string): boolean =>
  currentUserId !== bcCreatedBy;