'use client';

import { Box, Card, Skeleton, Typography } from '@mui/material';
import { formatDZD } from '@ferza/shared';
import type { CRMStats } from '@/modules/crm/hooks/useCRMStats';

interface KPICardProps {
  label:       string;
  value:       React.ReactNode;
  detail:      React.ReactNode;
  borderColor: string;
  valueColor:  string;
}

function KPICard({ label, value, detail, borderColor, valueColor }: KPICardProps) {
  return (
    <Card
      variant="outlined"
      sx={{ flex: '1 1 200px', minWidth: 180, borderLeft: `4px solid ${borderColor}`, p: 2 }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
        {label}
      </Typography>
      <Typography variant="h4" fontWeight={800} color={valueColor} mt={0.5} lineHeight={1.1}>
        {value}
      </Typography>
      <Box mt={0.5}>{detail}</Box>
    </Card>
  );
}

interface Props { stats: CRMStats | null; loading: boolean; }

export default function CRMKPICards({ stats, loading }: Props) {
  if (loading || !stats) {
    return (
      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" sx={{ flex: '1 1 200px', height: 100, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
      <KPICard
        label="Clients VIP"
        value={stats.vipCount}
        detail={
          <Typography variant="caption" color="text.secondary">
            CA moy: {formatDZD(stats.vipAvgCA)}
          </Typography>
        }
        borderColor="#d29922"
        valueColor="#d29922"
      />
      <KPICard
        label="Clients Fidèles"
        value={stats.fideleCount}
        detail={
          <Typography variant="caption" color="text.secondary">
            +{stats.newThisMonth} ce mois · Conv: {stats.conversionRate}%
          </Typography>
        }
        borderColor="#58a6ff"
        valueColor="#58a6ff"
      />
      <KPICard
        label="Nouveaux Clients"
        value={stats.nouveauCount}
        detail={
          <Typography variant="caption" color="text.secondary">
            Taux conversion: {stats.conversionRate}%
          </Typography>
        }
        borderColor="#2ea043"
        valueColor="#2ea043"
      />
      <KPICard
        label="Clients Inactifs"
        value={stats.inactifCount}
        detail={
          <Typography variant="caption" color="text.secondary">
            Campagnes de relance
          </Typography>
        }
        borderColor="#8b949e"
        valueColor="#8b949e"
      />
      <KPICard
        label="Tickets Support"
        value={stats.openTicketsCount}
        detail={
          <Typography variant="caption" color={stats.escalatedCount > 0 ? 'error.main' : 'text.secondary'} fontWeight={stats.escalatedCount > 0 ? 700 : 400}>
            {stats.escalatedCount} escaladé(s)
          </Typography>
        }
        borderColor="#bc8cff"
        valueColor="#bc8cff"
      />
      <KPICard
        label="Clients Bloqués"
        value={stats.blacklistedCount}
        detail={
          <Typography variant="caption" color={stats.blacklistedToday > 0 ? 'error.main' : 'text.secondary'} fontWeight={stats.blacklistedToday > 0 ? 700 : 400}>
            {stats.blacklistedToday > 0 ? `+${stats.blacklistedToday} aujourd'hui` : "Aucun ajout aujourd'hui"}
          </Typography>
        }
        borderColor="#B71C1C"
        valueColor="#B71C1C"
      />
    </Box>
  );
}
