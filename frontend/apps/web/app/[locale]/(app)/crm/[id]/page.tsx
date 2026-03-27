'use client';

import * as React from 'react';
import { Alert, Box, Skeleton, Typography } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button }    from '@mui/material';

import { useCRMCustomer }  from '@/modules/crm/hooks/useCRMCustomer';
import { useCRMTickets }   from '@/modules/crm/hooks/useCRMTickets';

import CRMDetailHeader     from '@/modules/crm/components/detail/CRMDetailHeader';
import CRMDetailTabNav, { type DetailTab } from '@/modules/crm/components/detail/CRMDetailTabNav';

import ActionsRapidesCard  from '@/modules/crm/components/detail/sidebar/ActionsRapidesCard';
import ProfilResumeCard    from '@/modules/crm/components/detail/sidebar/ProfilResumeCard';
import StatistiquesCard    from '@/modules/crm/components/detail/sidebar/StatistiquesCard';
import ZoneDangerCard      from '@/modules/crm/components/detail/sidebar/ZoneDangerCard';

import ProfilContactTab         from '@/modules/crm/components/detail/tabs/ProfilContactTab';
import HistoriqueCommandesTab   from '@/modules/crm/components/detail/tabs/HistoriqueCommandesTab';
import TicketsSupportTab        from '@/modules/crm/components/detail/tabs/TicketsSupportTab';
import RisqueFraudeTab          from '@/modules/crm/components/detail/tabs/RisqueFraudeTab';
import InteractionsNotesTab     from '@/modules/crm/components/detail/tabs/InteractionsNotesTab';

import NewTicketModal   from '@/modules/crm/components/modals/NewTicketModal';
import BlacklistModal   from '@/modules/crm/components/modals/BlacklistModal';

export default function CRMDetailPage() {
  const { id, locale } = useParams() as { id: string; locale: string };
  const router = useRouter();

  const customerQuery = useCRMCustomer(id);
  const ticketsQuery  = useCRMTickets({ customerId: id });

  const customer = customerQuery.data?.data ?? null;
  const tickets  = ticketsQuery.data?.data ?? [];
  const openTicketsCount = tickets.filter((t) => ['Ouvert', 'En cours'].includes(t.status)).length;

  const [activeTab,         setActiveTab]         = React.useState<DetailTab>(0);
  const [ticketModalOpen,   setTicketModalOpen]   = React.useState(false);
  const [blacklistOpen,     setBlacklistOpen]     = React.useState(false);

  if (customerQuery.isError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Client introuvable ou erreur BFF.
      </Alert>
    );
  }

  if (customerQuery.isLoading || !customer) {
    return (
      <Box>
        <Skeleton height={48} width={200} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={160} sx={{ mb: 2, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push(`/${locale}/crm`)}
        sx={{ mb: 2 }}
        size="small"
        variant="text"
      >
        Retour aux clients
      </Button>

      {/* Header */}
      <CRMDetailHeader
        customer={customer}
        onNewTicket={() => setTicketModalOpen(true)}
        onBlacklist={() => setBlacklistOpen(true)}
      />

      {/* 2-column layout */}
      <Box display="flex" gap={2} alignItems="flex-start">
        {/* LEFT: tabs */}
        <Box flex={1} minWidth={0}>
          <CRMDetailTabNav
            active={activeTab}
            onChange={setActiveTab}
            customer={customer}
            openTicketsCount={openTicketsCount}
          />
          {activeTab === 0 && <ProfilContactTab customer={customer} />}
          {activeTab === 1 && <HistoriqueCommandesTab customer={customer} />}
          {activeTab === 2 && <TicketsSupportTab customer={customer} onNewTicket={() => setTicketModalOpen(true)} />}
          {activeTab === 3 && <RisqueFraudeTab customerId={id} />}
          {activeTab === 4 && <InteractionsNotesTab />}
        </Box>

        {/* RIGHT: sidebar */}
        <Box sx={{ width: 300, flexShrink: 0 }}>
          <ActionsRapidesCard  customer={customer} onOpenTicket={() => setTicketModalOpen(true)} />
          <ProfilResumeCard    customer={customer} />
          <StatistiquesCard    customer={customer} />
          <ZoneDangerCard      customer={customer} onBlacklist={() => setBlacklistOpen(true)} />
        </Box>
      </Box>

      {/* Modals */}
      <NewTicketModal
        open={ticketModalOpen}
        customer={customer}
        onClose={() => setTicketModalOpen(false)}
      />
      <BlacklistModal
        open={blacklistOpen}
        customer={customer}
        onClose={() => setBlacklistOpen(false)}
      />
    </Box>
  );
}
