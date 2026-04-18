import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import { Stack } from '@mui/material';
import { formatDZD } from '@/modules/inventory/inventory.ui';
import type { InventoryStats } from '@/modules/inventory/inventory.types';
import InventoryMetricCard from './InventoryMetricCard';

interface InventoryMetricsRowProps {
  stats: InventoryStats;
}

export default function InventoryMetricsRow({ stats }: InventoryMetricsRowProps) {
  return (
    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
      <InventoryMetricCard
        icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />}
        accent="#58a6ff"
        subtitle="Valorisation FIFO totale"
        title={formatDZD(stats.stockValue)}
      />
      <InventoryMetricCard
        accent="#f85149"
        icon={<ReportProblemOutlinedIcon fontSize="small" />}
        title={String(stats.ruptures)}
        subtitle="Rupture de stock"
      />
      <InventoryMetricCard
        accent="#d29922"
        icon={<TrendingDownRoundedIcon fontSize="small" />}
        title={String(stats.lowStock)}
        subtitle="Sous le seuil de reappro."
      />
      <InventoryMetricCard
        accent="#bc8cff"
        icon={<Inventory2OutlinedIcon fontSize="small" />}
        title={`${stats.units} unites`}
        subtitle="Unites en stock"
      />
      <InventoryMetricCard
        accent="#58a6ff"
        icon={<SwapHorizRoundedIcon fontSize="small" />}
        title={String(stats.movementsToday)}
        subtitle="Mouvements aujourd'hui"
        helper={`${stats.movementsTodaySplit.incoming} entrees - ${stats.movementsTodaySplit.outgoing} sorties`}
      />
    </Stack>
  );
}
