'use client';

import { Box, Alert }  from '@mui/material';
import * as React      from 'react';
import { useState }    from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOMSStats } from '@/modules/oms/hooks/useOMSStats';
import { useOMSQueue } from '@/modules/oms/hooks/useOMSQueue';
import { fetchBFF }    from '@/lib/fetchBFF';
import type { Order }  from '@ferza/shared';
import AnalyticsTab    from '@/modules/oms/components/analytics/AnalyticsTab';
import AdvancedFiltersDrawer, {
  type AdvancedFilters,
} from '@/modules/oms/components/stats/AdvancedFiltersDrawer';
import {
  OMSPageHeader,
  OMSKPICards,
  CODFunnelSection,
  OMSTabNav,
  type OmsTab,
  OMSQueueTab,
  ToutesCommandesTab,
  NewOrderModal,
} from '@/modules/oms';
import SuiviCarrierTab    from '@/modules/oms/components/suivi-carrier/SuiviCarrierTab';
import RetoursLitigesTab  from '@/modules/oms/components/retours/RetoursLitigesTab';

/* ── CSV export helper ──────────────────────────────────── */

async function downloadOrdersCSV() {
  const result = await fetchBFF<{ data: Order[] }>('/bff/oms', { params: { limit: 1000 } });
  const orders = result.data;

  const HEADERS = ['Référence', 'Client', 'Téléphone', 'Wilaya', 'COD (DZD)', 'Statut', 'Carrier', 'Date création'];
  const rows = orders.map((o) => [
    o.reference,
    o.customerNameFr,
    o.customerPhone,
    o.wilayaCode,
    o.codAmount,
    o.status,
    o.carrier ?? '',
    new Date(o.createdAt).toLocaleDateString('fr-FR'),
  ]);

  const csv = [HEADERS, ...rows].map((r) => r.join(';')).join('\n');
  // BOM so Excel opens UTF-8 correctly
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `commandes-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Page ───────────────────────────────────────────────── */

export default function OMSPage() {
  const [activeTab,           setActiveTab]           = useState<OmsTab>('file-attente');
  const [carrierFilter,       setCarrierFilter]       = useState<string | null>(null);
  const [newOrderOpen,        setNewOrderOpen]        = useState(false);
  const [filtersDrawerOpen,   setFiltersDrawerOpen]   = useState(false);
  const [advancedFilters,     setAdvancedFilters]     = useState<AdvancedFilters>({
    dateFrom: null,
    dateTo: null,
    codMin: null,
    codMax: null,
    riskLevel: [],
    source: [],
    attempts: null,
    hasCarrier: null,
  });

  const statsQuery = useOMSStats();
  const queueQuery = useOMSQueue();

  const stats      = statsQuery.data?.data  ?? null;
  const queueCount = queueQuery.data?.data?.length ?? 0;

  const locale = useParams()?.locale ?? 'fr';
  const router = useRouter();

  const handleViewOrder = React.useCallback(
    (orderId: string) => {
      router.push(`/${locale}/oms/${orderId}`);
    },
    [locale, router],
  );

  const handleFilterByCarrier = React.useCallback((carrier: string) => {
    setCarrierFilter(carrier);
    setActiveTab('toutes-commandes');
  }, []);

  const handleTabChange = React.useCallback((newTab: OmsTab) => {
    setActiveTab(newTab);
    if (newTab !== 'toutes-commandes') setCarrierFilter(null);
  }, []);

  // ── Header button handlers ────────────────────────────
  const handleExport = React.useCallback(() => {
    downloadOrdersCSV().catch(() => {/* BFF unavailable — silently ignore */});
  }, []);

  const handleAnalytics = React.useCallback(() => {
    handleTabChange('analytics');
  }, [handleTabChange]);

  const handleApplyAdvancedFilters = React.useCallback((filters: AdvancedFilters) => {
    setAdvancedFilters(filters);
    setActiveTab('toutes-commandes');
  }, []);

  if (statsQuery.isError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Impossible de charger les données OMS. Vérifiez que le BFF est démarré
        sur le port 4000 avec <code>USE_MOCK=true</code>.
      </Alert>
    );
  }

  return (
    <Box>
      <OMSPageHeader
        lastUpdatedAt={stats?.lastUpdatedAt ?? null}
        onNewOrder={() => setNewOrderOpen(true)}
        onExport={handleExport}
        onAnalytics={handleAnalytics}
        onFiltresAvances={() => setFiltersDrawerOpen(true)}
      />
      <OMSKPICards    stats={stats} loading={statsQuery.isLoading} />
      <CODFunnelSection stats={stats} loading={statsQuery.isLoading} />
      <OMSTabNav
        active={activeTab}
        onChange={handleTabChange}
        queueCount={queueCount}
      />

      {activeTab === 'file-attente'     && <OMSQueueTab />}
      {activeTab === 'toutes-commandes' && (
        <ToutesCommandesTab
          carrierFilter={carrierFilter}
          onClearCarrierFilter={() => setCarrierFilter(null)}
          advancedFilters={advancedFilters}
        />
      )}
      {activeTab === 'suivi-carrier'    && (
        <SuiviCarrierTab onFilterByCarrier={handleFilterByCarrier} />
      )}
      {activeTab === 'retours-litiges'  && <RetoursLitigesTab />}
      {activeTab === 'analytics'        && <AnalyticsTab />}

      <NewOrderModal open={newOrderOpen} onClose={() => setNewOrderOpen(false)} />

      <AdvancedFiltersDrawer
        open={filtersDrawerOpen}
        onClose={() => setFiltersDrawerOpen(false)}
        onApply={handleApplyAdvancedFilters}
      />
    </Box>
  );
}
