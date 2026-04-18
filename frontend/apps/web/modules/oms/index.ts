// ─── Hooks ───────────────────────────────────────────────────────────────────
export { useOMSStats }      from './hooks/useOMSStats';
export type { OMSStats }    from './hooks/useOMSStats';
export { useOMSOrders }     from './hooks/useOMSOrders';
export { useOMSOrder }      from './hooks/useOMSOrder';
export { useOMSQueue }      from './hooks/useOMSQueue';
export { useConfirmOrder }  from './hooks/useConfirmOrder';
export { useCancelOrder }   from './hooks/useCancelOrder';
export { useAssignCarrier } from './hooks/useAssignCarrier';
export { useDeliverOrder }  from './hooks/useDeliverOrder';
export { useCreateOrder }   from './hooks/useCreateOrder';
export { useReturnAction }  from './hooks/useReturnAction';

// ─── stats/ — Subtask 2 ───────────────────────────────────────────────────────
export { default as OMSPageHeader }    from './components/stats/OMSPageHeader';
export { default as OMSKPICards }      from './components/stats/OMSKPICards';
export { default as CODFunnelSection } from './components/stats/CODFunnelSection';
export { default as OMSTabNav }        from './components/stats/OMSTabNav';
export type { OmsTab }                 from './components/stats/OMSTabNav';

// ─── queue/ — Subtasks 1 + 3 ─────────────────────────────────────────────────
export { default as OrderStatusChip, STATUS_LABEL } from './components/queue/OrderStatusChip';
export { default as OMSQueueTab }      from './components/queue/OMSQueueTab';
export { default as QueueRow }         from './components/queue/QueueRow';
export { default as QueueTable }       from './components/queue/QueueTable';

// ─── list/ — Subtask 4 ────────────────────────────────────────────────────────
export { default as ToutesCommandesTab } from './components/list/ToutesCommandesTab';
export { default as OrdersRow }          from './components/list/OrdersRow';
export { default as OrdersTable }        from './components/list/OrdersTable';
export { default as OrdersFilters }      from './components/list/OrdersFilters';

// ─── modals/ — Subtask 5 (stubs) ─────────────────────────────────────────────
export { default as ConfirmOrderModal }  from './components/modals/ConfirmOrderModal';
export { default as CancelOrderModal }   from './components/modals/CancelOrderModal';
export { default as AssignCarrierModal } from './components/modals/AssignCarrierModal';
export { default as NewOrderModal }      from './components/modals/NewOrderModal';



export { useOMSSuivi } from './hooks/useOMSSuivi';
export type { SuiviData, CarrierData, CarrierShipment } from './hooks/useOMSSuivi';
 
// --- ADD to components section ---
export { default as CarrierCard } from '@/modules/oms/components/suivi-carrier/Carriercard';
export { default as SuiviCarrierTab } from '@/modules/oms/components/suivi-carrier/SuiviCarrierTab';
 
export { useOMSRetours } from './hooks/useOMSRetours';
export type {
  RetoursLitigesData,
  RetourItem,
  LitigeItem,
  RaisonCategory,
  EtatReceptionKey,
  LitigeSeverity,
  LitigeStatusKey,
} from './hooks/useOMSRetours';
 
// --- ADD to components section ---
export { default as RetoursTable } from './components/retours/RetoursTable';
export { default as LitigeCard } from './components/retours/LitigeCard';
export { default as RetoursLitigesTab } from './components/retours/RetoursLitigesTab';



export { useOMSAnalytics, PERIOD_OPTIONS } from './hooks/useOMSAnalytics';
export type {
  AnalyticsPeriod,
  AnalyticsPayload,
  VolumeData,
  VolumeDay,
  OperateursData,
  OperateurRow,
  CarrierRepartitionData,
  DonutSlice,
  CarrierTauxRow,
  WilayasData,
  WilayaRow,
  AnnulationsData,
  AnnulationRow,
} from './hooks/useOMSAnalytics';
 
// --- ADD to components section ---
export { default as VolumeChart } from './components/analytics/VolumeChart';
export { default as OperateurPerformanceChart } from './components/analytics/OperateurPerformanceChart';
export { default as CarrierDonutChart } from './components/analytics/CarrierDonutChart';
export { default as WilayasChart } from './components/analytics/WilayasChart';
export { default as AnnulationsChart } from './components/analytics/AnnulationsChart';
export { default as AnalyticsTab } from './components/analytics/AnalyticsTab';
 


export { default as OrderDetailHeader } from './components/detail/OrderDetailHeader';
export { default as OrderDetailTabs } from './components/detail/OrderDetailTabs';
 
// Detail — Sidebar cards
export { default as ResumeCommandeCard } from './components/detail/sidebar/ResumeCommandeCard';
export { default as ClientRisqueCard } from './components/detail/sidebar/ClientRisqueCard';
export { default as StockReserveCard } from './components/detail/sidebar/StockReserveCard';
export { default as ActionRapideCard } from './components/detail/sidebar/ActionRapideCard';
 
// Detail — Tab content
export { default as OrderCommandeTab } from './components/detail/tabs/OrderCommandeTab';
export { default as OrderSuiviTab } from './components/detail/tabs/OrderSuiviTab';
export { default as OrderHistoriqueTab } from './components/detail/tabs/OrderHistoriqueTab';
export { default as OrderClientRisqueTab } from './components/detail/tabs/OrderClientRisqueTab';
export { default as OrderPaiementTab } from './components/detail/tabs/OrderPaiementTab';
 

