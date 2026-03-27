'use client';

import { Box, Button, Chip, Skeleton, Typography } from '@mui/material';
import PersonAddIcon    from '@mui/icons-material/PersonAdd';
import PhoneCallbackIcon from '@mui/icons-material/PhoneCallback';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SegmentIcon      from '@mui/icons-material/Segment';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import type { CRMStats } from '@/modules/crm/hooks/useCRMStats';

interface Props {
  stats:          CRMStats | null;
  loading:        boolean;
  onNewCustomer:  () => void;
  onAppelEntrant: () => void;
  onExport:       () => void;
  onSegments?:    () => void;
}

export default function CRMPageHeader({ stats, loading, onNewCustomer, onAppelEntrant, onExport, onSegments }: Props) {
  const subtitle = loading || !stats
    ? null
    : `${stats.totalCustomers} clients · ${stats.activeCount} actifs (30j) · ${stats.wilayaCount} wilayas · Identifiant: téléphone`;

  return (
    <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2} flexWrap="wrap" gap={2}>
      <Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h5" fontWeight={700}>Clients</Typography>
          <Chip
            icon={<FiberManualRecordIcon sx={{ fontSize: '10px !important', color: 'success.main' }} />}
            label="Synchronisé avec OMS"
            size="small"
            variant="outlined"
            sx={{ color: 'success.main', borderColor: 'success.main', fontSize: 11 }}
          />
        </Box>
        {loading
          ? <Skeleton width={380} height={20} />
          : subtitle && (
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {subtitle}
            </Typography>
          )
        }
      </Box>

      <Box display="flex" gap={1} flexWrap="wrap">
        <Button variant="outlined" size="small" startIcon={<FileDownloadIcon />} onClick={onExport}>
          Exporter
        </Button>
        <Button variant="outlined" size="small" startIcon={<SegmentIcon />} onClick={onSegments}>
          Segments
        </Button>
        <Button variant="outlined" size="small" startIcon={<PhoneCallbackIcon />} onClick={onAppelEntrant}>
          Appel entrant
        </Button>
        <Button variant="contained" size="small" startIcon={<PersonAddIcon />} onClick={onNewCustomer}>
          Nouveau Client
        </Button>
      </Box>
    </Box>
  );
}
