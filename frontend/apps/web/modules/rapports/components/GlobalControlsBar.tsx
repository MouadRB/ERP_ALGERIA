'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon       from '@mui/icons-material/Refresh';
import LockIcon          from '@mui/icons-material/Lock';
import FileDownloadIcon  from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon  from '@mui/icons-material/PictureAsPdf';
import TableChartIcon    from '@mui/icons-material/TableChart';
import DataObjectIcon    from '@mui/icons-material/DataObject';
import SummarizeIcon     from '@mui/icons-material/Summarize';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { usePeriod, type PeriodPreset } from '@/modules/rapports/context/PeriodContext';
import * as XLSX from 'xlsx';

// ── Period options ──────────────────────────────────────────────────────────

const PERIOD_OPTIONS: { value: PeriodPreset; label: string }[] = [
  { value: 'today',   label: "Aujourd'hui" },
  { value: '7d',      label: '7 jours'     },
  { value: '30d',     label: '30 jours'    },
  { value: 'quarter', label: 'Ce trimestre' },
  { value: 'year',    label: 'Cette année'  },
];

// ── Export menu items ───────────────────────────────────────────────────────

const EXPORT_OPTIONS = [
  { key: 'pdf',    label: 'PDF complet',                         icon: <PictureAsPdfIcon fontSize="small" /> },
  { key: 'excel',  label: 'Excel (.xlsx)',                       icon: <TableChartIcon fontSize="small" /> },
  { key: 'csv',    label: 'CSV (données brutes)',                icon: <DataObjectIcon fontSize="small" /> },
  { key: 'report', label: 'Rapport direction (PDF simplifié)',   icon: <SummarizeIcon fontSize="small" /> },
];

// ── Tab metadata ────────────────────────────────────────────────────────────

const TAB_META: Record<number, { label: string; dataKey: string }> = {
  0: { label: "Vue d'Ensemble",       dataKey: 'overview'    },
  1: { label: 'Ventes & OMS',         dataKey: 'ventes'      },
  2: { label: 'Produits & Catalogue', dataKey: 'produits'    },
  3: { label: 'Inventaire & Stock',   dataKey: 'inventaire'  },
  4: { label: 'Clients & CRM',        dataKey: 'clients'     },
  5: { label: 'Approvisionnement',    dataKey: 'appro'       },
  6: { label: 'Cross-Module',         dataKey: 'crossModule' },
};

// ── Data sources ────────────────────────────────────────────────────────────

const DATA_SOURCES = ['PIM', 'Inventaire', 'Catalogue', 'OMS', 'CRM', 'Approvisionnement'];

// ── Helpers ─────────────────────────────────────────────────────────────────

function timeSince(date: Date): string {
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1)  return 'maintenant';
  if (mins === 1) return 'il y a 1 min';
  return `il y a ${mins} min`;
}

// ── Component ───────────────────────────────────────────────────────────────

export interface GlobalControlsBarProps {
  activeTab?: number;
  exportData?: {
    overview?: any;
    ventes?: any;
    produits?: any;
    inventaire?: any;
    clients?: any;
    appro?: any;
    crossModule?: any;
    periodLabel?: string;
  };
}

export default function GlobalControlsBar({ exportData, activeTab = 1 }: GlobalControlsBarProps) {
  const { period, lastRefresh, setPeriod, refresh } = usePeriod();
  const [, forceUpdate] = React.useState(0);

  // Export menu
  const [exportAnchor, setExportAnchor] = React.useState<HTMLElement | null>(null);
  const [snackbar, setSnackbar] = React.useState<string | null>(null);
  const [exportingKey, setExportingKey] = React.useState<string | null>(null);

  // Update "il y a N min" every 30s
  React.useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const downloadFile = (filename: string, content: string | Blob, mime?: string) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const buildVentesWorkbook = (ventes: any) => {
    const wb = XLSX.utils.book_new();
    if (!ventes) return wb;

    const caSheet = XLSX.utils.json_to_sheet(
      (ventes.caByDay || []).map((row: any) => ({
        Date: row.date,
        CA: row.ca,
        Commandes: row.count,
      }))
    );
    XLSX.utils.book_append_sheet(wb, caSheet, 'CA par jour');

    const statusSheet = XLSX.utils.json_to_sheet(
      (ventes.statusDistribution || []).map((row: any) => ({
        Statut: row.status,
        Commandes: row.count,
      }))
    );
    XLSX.utils.book_append_sheet(wb, statusSheet, 'Statuts');

    const opsSheet = XLSX.utils.json_to_sheet(
      (ventes.operatorPerformance || []).map((row: any) => ({
        Operateur: row.name,
        TauxConfirmation: row.tauxConfirmation,
      }))
    );
    XLSX.utils.book_append_sheet(wb, opsSheet, 'Operateurs');

    const carrierSheet = XLSX.utils.json_to_sheet(
      (ventes.carrierPerformance || []).map((row: any) => ({
        Carrier: row.name,
        Total: row.total,
        Livre: row.delivered,
        Echec: row.failed,
        TauxLivraison: row.tauxLivraison,
        DelaiMoyen: row.delaiMoyen,
        Wilayas: row.wilayas,
      }))
    );
    XLSX.utils.book_append_sheet(wb, carrierSheet, 'Carriers');

    return wb;
  };

  const buildVentesCsv = (ventes: any) => {
    const lines: string[] = [];
    const csvCell = (value: any) => {
      if (value == null) return '';
      const str = String(value).replace(/"/g, '""');
      return `"${str}"`;
    };
    const pushSection = (title: string, headers: string[], rows: any[]) => {
      lines.push(title);
      lines.push(headers.map(csvCell).join(','));
      rows.forEach((row) => {
        lines.push(headers.map((key) => csvCell(row[key])).join(','));
      });
      lines.push('');
    };

    if (!ventes) return '';

    pushSection('CA par jour', ['Date', 'CA', 'Commandes'],
      (ventes.caByDay || []).map((row: any) => ({
        Date: row.date,
        CA: row.ca,
        Commandes: row.count,
      }))
    );

    pushSection('Statuts', ['Statut', 'Commandes'],
      (ventes.statusDistribution || []).map((row: any) => ({
        Statut: row.status,
        Commandes: row.count,
      }))
    );

    pushSection('Operateurs', ['Operateur', 'TauxConfirmation'],
      (ventes.operatorPerformance || []).map((row: any) => ({
        Operateur: row.name,
        TauxConfirmation: row.tauxConfirmation,
      }))
    );

    pushSection('Carriers', ['Carrier', 'Total', 'Livre', 'Echec', 'TauxLivraison', 'DelaiMoyen', 'Wilayas'],
      (ventes.carrierPerformance || []).map((row: any) => ({
        Carrier: row.name,
        Total: row.total,
        Livre: row.delivered,
        Echec: row.failed,
        TauxLivraison: row.tauxLivraison,
        DelaiMoyen: row.delaiMoyen,
        Wilayas: row.wilayas,
      }))
    );

    return lines.join('\n');
  };

  const buildVentesPdf = async (ventes: any, periodLabel: string) => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Rapports - Ventes & OMS', 14, 18);
    doc.setFontSize(10);
    doc.text(`Periode: ${periodLabel}`, 14, 24);
    doc.text(`Genere le: ${new Date().toLocaleString()}`, 14, 30);

    let y = 36;
    if (ventes?.caByDay?.length) {
      autoTable(doc, {
        startY: y,
        head: [['Date', 'CA', 'Commandes']],
        body: ventes.caByDay.map((row: any) => [row.date, row.ca, row.count]),
        styles: { fontSize: 9 },
      });
      y = (doc as any).lastAutoTable.finalY + 6;
    }

    if (ventes?.statusDistribution?.length) {
      autoTable(doc, {
        startY: y,
        head: [['Statut', 'Commandes']],
        body: ventes.statusDistribution.map((row: any) => [row.status, row.count]),
        styles: { fontSize: 9 },
      });
    }

    return doc.output('blob');
  };

  // ── Generic builders (for non-Ventes tabs) ────────────────────────────────

  const buildGenericWorkbook = (data: any) => {
    const wb = XLSX.utils.book_new();
    if (!data) return wb;
    Object.entries(data).forEach(([sheetName, val]) => {
      if (Array.isArray(val) && val.length > 0) {
        const sheet = XLSX.utils.json_to_sheet(val as object[]);
        XLSX.utils.book_append_sheet(wb, sheet, sheetName.slice(0, 31));
      }
    });
    return wb;
  };

  const buildGenericCsv = (data: any): string => {
    if (!data) return '';
    const csvCell = (value: any) => {
      if (value == null) return '';
      return `"${String(value).replace(/"/g, '""')}"`;
    };
    const lines: string[] = [];
    Object.entries(data).forEach(([section, val]) => {
      if (Array.isArray(val) && val.length > 0) {
        const headers = Object.keys((val as any[])[0]);
        lines.push(section);
        lines.push(headers.map(csvCell).join(','));
        (val as any[]).forEach((row) => lines.push(headers.map((h) => csvCell(row[h])).join(',')));
        lines.push('');
      }
    });
    return lines.join('\n');
  };

  const buildGenericPdf = async (data: any, tabLabel: string, periodLabel: string): Promise<Blob> => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Rapports — ${tabLabel}`, 14, 18);
    doc.setFontSize(10);
    doc.text(`Période : ${periodLabel}`, 14, 24);
    doc.text(`Généré le : ${new Date().toLocaleString()}`, 14, 30);
    let y = 36;
    if (data) {
      for (const [, val] of Object.entries(data)) {
        if (Array.isArray(val) && val.length > 0) {
          const headers = Object.keys((val as any[])[0]);
          autoTable(doc, {
            startY: y,
            head: [headers],
            body: (val as any[]).map((row) => headers.map((h) => row[h] ?? '')),
            styles: { fontSize: 8 },
          });
          y = (doc as any).lastAutoTable.finalY + 6;
          if (y > 260) { doc.addPage(); y = 14; }
        }
      }
    }
    return doc.output('blob');
  };

  // ── Export handler ─────────────────────────────────────────────────────────

  const EXPORT_FEEDBACK: Record<string, string> = {
    pdf:    'Export PDF en cours de génération...',
    excel:  'Export Excel (.xlsx) en cours...',
    csv:    'Export CSV en cours...',
    report: 'Rapport direction en cours de génération...',
  };

  const handleExport = async (key: string) => {
    setExportAnchor(null);
    setSnackbar(EXPORT_FEEDBACK[key] ?? 'Export en cours...');
    setExportingKey(key);

    const stamp       = new Date().toISOString().slice(0, 10);
    const meta        = TAB_META[activeTab] ?? TAB_META[1];
    const periodLabel = exportData?.periodLabel ?? period;
    const tabData     = exportData?.[meta.dataKey as keyof typeof exportData];
    const isVentes    = activeTab === 1;

    try {
      if (key === 'csv') {
        const csv = isVentes ? buildVentesCsv(tabData) : buildGenericCsv(tabData);
        downloadFile(`rapports-${meta.dataKey}-${stamp}.csv`, csv, 'text/csv');
      } else if (key === 'excel') {
        const wb      = isVentes ? buildVentesWorkbook(tabData) : buildGenericWorkbook(tabData);
        const xlsData = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
        downloadFile(`rapports-${meta.dataKey}-${stamp}.xlsx`, new Blob([xlsData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      } else if (key === 'report') {
        const pdfBlob = isVentes
          ? await buildVentesPdf(tabData, periodLabel)
          : await buildGenericPdf(tabData, meta.label, periodLabel);
        downloadFile(`rapport-direction-${meta.dataKey}-${stamp}.pdf`, pdfBlob);
      } else {
        const pdfBlob = isVentes
          ? await buildVentesPdf(tabData, periodLabel)
          : await buildGenericPdf(tabData, meta.label, periodLabel);
        downloadFile(`rapports-${meta.dataKey}-${stamp}.pdf`, pdfBlob);
      }
    } finally {
      setExportingKey(null);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      {/* ── Main controls row ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
          p: 1.5,
          bgcolor: 'grey.50',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Period icon */}
        <CalendarMonthIcon fontSize="small" color="action" />

        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mr: 0.5 }}>
          Période:
        </Typography>

        {/* Period chips */}
        {PERIOD_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            size="small"
            variant={period === opt.value ? 'filled' : 'outlined'}
            color={period === opt.value ? 'primary' : 'default'}
            onClick={() => setPeriod(opt.value)}
            sx={{ fontWeight: period === opt.value ? 700 : 400 }}
          />
        ))}

        {/* Personnalisé chip */}
        <Chip
          label="Personnalisé"
          size="small"
          variant="outlined"
          color="default"
          onClick={() => {
            // TODO: open a date range picker popover
            console.log('Custom date picker');
          }}
          sx={{ fontWeight: 400 }}
        />

        <Box flex={1} />

        {/* Refresh */}
        <Tooltip title="Rafraîchir les données">
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={refresh}
            sx={{ textTransform: 'none' }}
          >
            Rafraîchir · {timeSince(lastRefresh)}
          </Button>
        </Tooltip>

        {/* Export dropdown */}
        <Button
          size="small"
          startIcon={<FileDownloadIcon />}
          onClick={(e) => setExportAnchor(e.currentTarget)}
          variant="outlined"
          sx={{ textTransform: 'none' }}
          disabled={!!exportingKey}
        >
          Exporter
        </Button>
        <Menu
          anchorEl={exportAnchor}
          open={Boolean(exportAnchor)}
          onClose={() => setExportAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {EXPORT_OPTIONS.map((opt) => (
            <MenuItem key={opt.key} onClick={() => handleExport(opt.key)} disabled={!!exportingKey}>
              <ListItemIcon>{exportingKey === opt.key ? <CircularProgress size={16} /> : opt.icon}</ListItemIcon>
              <ListItemText>{opt.label}</ListItemText>
            </MenuItem>
          ))}
        </Menu>

        {/* Read-only badge */}
        <Tooltip title="Données en lecture seule">
          <Chip
            icon={<LockIcon />}
            label="Lecture seule"
            size="small"
            variant="outlined"
            sx={{ fontSize: 11 }}
          />
        </Tooltip>
      </Box>

      {/* ── Data sources label ── */}
      <Box display="flex" justifyContent="flex-end" mt={0.75}>
        <Typography variant="caption" color="text.disabled">
          Données source:{' '}
          {DATA_SOURCES.map((src, i) => (
            <React.Fragment key={src}>
              <Typography
                component="span"
                variant="caption"
                sx={{ fontWeight: 500, color: 'text.secondary' }}
              >
                {src}
              </Typography>
              {i < DATA_SOURCES.length - 1 && ' · '}
            </React.Fragment>
          ))}
        </Typography>
      </Box>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" variant="filled" onClose={() => setSnackbar(null)}>
          {snackbar}
        </Alert>
      </Snackbar>
    </Box>
  );
}
