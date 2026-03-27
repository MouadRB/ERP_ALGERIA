import type { QueryClient } from '@tanstack/react-query';

export const invalidateCRMQueries = (qc: QueryClient, customerId?: string) => {
  // Always invalidate global CRM lists
  qc.invalidateQueries({ queryKey: ['crm', 'customers'] });
  qc.invalidateQueries({ queryKey: ['crm', 'stats'] });
  qc.invalidateQueries({ queryKey: ['crm', 'analytics'] });
  // Invalidate ALL ticket queries (prefix match covers every param combination)
  qc.invalidateQueries({ queryKey: ['crm', 'tickets'] });

  if (customerId) {
    qc.invalidateQueries({ queryKey: ['crm', 'customer', customerId] });
    qc.invalidateQueries({ queryKey: ['crm', 'risk', customerId] });
  }
};
