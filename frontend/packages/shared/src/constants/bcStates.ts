export const BC_STATES = [
  'Draft',
  'PendingApproval',
  'Approved',
  'SentToSupplier',
  'PartiallyReceived',
  'FullyReceived',
  'Invoiced',
  'Rejected',
  'Cancelled',
] as const;

export type BCState = (typeof BC_STATES)[number];

export const BC_TERMINAL_STATES: BCState[] = [
  'Invoiced',
  'Rejected',
  'Cancelled',
];

export const BC_APPROBATION_ROLES = [
  'SUPERADMIN',
  'FINANCE_DIRECTOR',
] as const;