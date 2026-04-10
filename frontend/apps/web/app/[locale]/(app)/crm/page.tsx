'use client';

import * as React      from 'react';
import { Alert, Box }  from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import type { Customer } from '@ferza/shared';

import { fetchBFF }    from '@/lib/fetchBFF';

// ─── CSV export (no external library) ────────────────────────────────────────
function downloadCSV(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape  = (v: unknown) => {
    const s = String(v ?? '').replace(/"/g, '""');
    return /[",\n\r]/.test(s) ? `"${s}"` : s;
  };
  const csv = [
    headers.map(escape).join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ].join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
import { useCRMStats } from '@/modules/crm/hooks/useCRMStats';

import AlertBanner      from '@/modules/crm/components/stats/AlertBanner';
import CRMPageHeader    from '@/modules/crm/components/stats/CRMPageHeader';
import CRMKPICards      from '@/modules/crm/components/stats/CRMKPICards';
import CRMTabNav, { type CrmTab } from '@/modules/crm/components/stats/CRMTabNav';
import TousLesClientsTab from '@/modules/crm/components/list/TousLesClientsTab';
import FileSupportTab   from '@/modules/crm/components/tickets/FileSupportTab';
import ListeNoireTab    from '@/modules/crm/components/blacklist/ListeNoireTab';
import SegmentsAnalytiquesTab from '@/modules/crm/components/analytics/SegmentsAnalytiquesTab';
import NewCustomerModal from '@/modules/crm/components/modals/NewCustomerModal';
import AppelEntrantModal from '@/modules/crm/components/modals/AppelEntrantModal';
import NewTicketModal   from '@/modules/crm/components/modals/NewTicketModal';
import BlacklistModal   from '@/modules/crm/components/modals/BlacklistModal';
import SegmentsDialog  from '@/modules/crm/components/modals/SegmentsDialog';

export default function CRMPage() {
  const router = useRouter();
  const locale = (useParams()?.locale as string | undefined) ?? 'fr';

  const statsQuery = useCRMStats();
  const stats      = statsQuery.data?.data ?? null;

  const [activeTab,           setActiveTab]           = React.useState<CrmTab>(0);
  const [ticketInitialStatus, setTicketInitialStatus] = React.useState<string | undefined>();
  const [customerInitialSegment, setCustomerInitialSegment] = React.useState<string | undefined>();
  const [newCustomerOpen,     setNewCustomerOpen]     = React.useState(false);
  const [appelEntrantOpen,    setAppelEntrantOpen]    = React.useState(false);
  const [ticketCustomer,      setTicketCustomer]      = React.useState<Customer | null>(null);
  const [blacklistCustomer,   setBlacklistCustomer]   = React.useState<Customer | null>(null);
  const [segmentsOpen,        setSegmentsOpen]        = React.useState(false);

  const handleViewAlerts = React.useCallback(() => {
    setTicketInitialStatus('Escaladé');
    setActiveTab(1);
  }, []);

  const handleTabChange = React.useCallback((tab: CrmTab) => {
    setActiveTab(tab);
    // Clear pre-filters when manually switching tabs
    if (tab !== 1) setTicketInitialStatus(undefined);
    if (tab !== 0) setCustomerInitialSegment(undefined);
  }, []);

  const handleSegments = React.useCallback(() => {
    setSegmentsOpen(true);
  }, []);

  const handleSelectSegment = React.useCallback((segment: string) => {
    if (segment === 'Liste noire') {
      setActiveTab(2);
    } else {
      setCustomerInitialSegment(segment);
      setActiveTab(0);
    }
  }, []);

  const handleShowVIP = React.useCallback(() => {
    setCustomerInitialSegment('VIP');
    setActiveTab(0);
  }, []);

  const handleExport = React.useCallback(() => {
    const doExport = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let rows: Record<string, unknown>[] = [];
        let filename = '';
        const date = new Date().toISOString().slice(0, 10);

        if (activeTab === 0) {
          const res = await fetchBFF<{ data: Customer[] }>('/bff/crm', { params: { pageSize: 100 } });
          const customers = res.data ?? [];
          if (!customers.length) return;
          rows = customers.map((c) => ({
            'ID':              c.id,
            'Nom':             c.nameFr,
            'Téléphone':       c.phone,
            'Wilaya':          c.wilayaCode,
            'Segment':         c.segment,
            'Total Commandes': c.totalOrders,
            'CA Total':        c.totalSpentTTC,
            'Taux Retour':     `${c.tauxRetour ?? 0}%`,
            'Risque':          c.riskLevel,
          }));
          filename = `crm-clients-${date}.csv`;
        } else if (activeTab === 1) {
          const res = await fetchBFF<{ data: Array<{ id: string; customerNameFr: string; customerPhone: string; category: string; status: string; priority: string; agentName: string | null; escalated: boolean; createdAt: string }> }>('/bff/crm/tickets', { params: { pageSize: 100 } });
          const tickets = res.data ?? [];
          if (!tickets.length) return;
          rows = tickets.map((t) => ({
            'ID':        t.id,
            'Client':    t.customerNameFr,
            'Téléphone': t.customerPhone,
            'Catégorie': t.category,
            'Statut':    t.status,
            'Priorité':  t.priority,
            'Agent':     t.agentName ?? 'Non assigné',
            'Escaladé':  t.escalated ? 'Oui' : 'Non',
            'Créé le':   t.createdAt.slice(0, 10),
          }));
          filename = `crm-tickets-${date}.csv`;
        } else if (activeTab === 2) {
          const res = await fetchBFF<{ data: Customer[] }>('/bff/crm', { params: { blacklisted: true, pageSize: 100 } });
          const customers = res.data ?? [];
          if (!customers.length) return;
          rows = customers.map((c) => ({
            'ID':             c.id,
            'Nom':            c.nameFr,
            'Téléphone':      c.phone,
            'Wilaya':         c.wilayaCode,
            'Motif':          c.blacklistMotif ?? '',
            'Date Blacklist': c.blacklistedAt ?? '',
          }));
          filename = `crm-liste-noire-${date}.csv`;
        } else {
          return;
        }

        downloadCSV(rows, filename);
      } catch { /* silent */ }
    };
    doExport();
  }, [activeTab]);

  const handleNewCustomerCreated = React.useCallback(
    (id: string) => {
      setNewCustomerOpen(false);
      router.push(`/${locale}/crm/${id}`);
    },
    [locale, router],
  );

  if (statsQuery.isError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Impossible de charger les données CRM. Vérifiez que le BFF est démarré
        sur le port 4000 avec <code>USE_MOCK=true</code>.
      </Alert>
    );
  }

  return (
    <Box>
      <AlertBanner
        stats={stats}
        onViewAlerts={handleViewAlerts}
      />

      <CRMPageHeader
        stats={stats}
        loading={statsQuery.isLoading}
        onNewCustomer={() => setNewCustomerOpen(true)}
        onAppelEntrant={() => setAppelEntrantOpen(true)}
        onExport={handleExport}
        onSegments={handleSegments}
      />

      <CRMKPICards stats={stats} loading={statsQuery.isLoading} />

      <CRMTabNav active={activeTab} onChange={handleTabChange} stats={stats} />

      {activeTab === 0 && (
        <TousLesClientsTab
          stats={stats}
          initialSegment={customerInitialSegment}
          onOpenTicket={(c) => setTicketCustomer(c)}
          onBlacklist={(c)  => setBlacklistCustomer(c)}
        />
      )}
      {activeTab === 1 && <FileSupportTab initialStatus={ticketInitialStatus} />}
      {activeTab === 2 && <ListeNoireTab />}
      {activeTab === 3 && <SegmentsAnalytiquesTab onShowVIP={handleShowVIP} />}

      {/* Modals */}
      <NewCustomerModal
        open={newCustomerOpen}
        onClose={() => setNewCustomerOpen(false)}
        onCreated={handleNewCustomerCreated}
      />
      <AppelEntrantModal
        open={appelEntrantOpen}
        onClose={() => setAppelEntrantOpen(false)}
      />
      <NewTicketModal
        open={Boolean(ticketCustomer)}
        customer={ticketCustomer}
        onClose={() => setTicketCustomer(null)}
      />
      <BlacklistModal
        open={Boolean(blacklistCustomer)}
        customer={blacklistCustomer}
        onClose={() => setBlacklistCustomer(null)}
      />
      <SegmentsDialog
        open={segmentsOpen}
        stats={stats}
        onClose={() => setSegmentsOpen(false)}
        onSelectSegment={handleSelectSegment}
      />
    </Box>
  );
}
