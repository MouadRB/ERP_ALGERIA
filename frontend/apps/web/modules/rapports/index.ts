// ─── Hooks ──────────────────────────────────────────────────────────────────
export { useRapportsOverview }    from './hooks/useRapportsOverview';
export { useRapportsVentes }      from './hooks/useRapportsVentes';
export { useRapportsProduits }    from './hooks/useRapportsProduits';
export { useRapportsInventaire }  from './hooks/useRapportsInventaire';
export { useRapportsClients }     from './hooks/useRapportsClients';
export { useRapportsAppro }       from './hooks/useRapportsAppro';
export { useRapportsCrossModule } from './hooks/useRapportsCrossModule';

// ─── Context ────────────────────────────────────────────────────────────────
export { PeriodProvider, usePeriod } from './context/PeriodContext';
export type { PeriodPreset, PeriodContextValue } from './context/PeriodContext';

// ─── Utils ──────────────────────────────────────────────────────────────────
export * from './utils/formatters';
export * from './utils/chartColors';
