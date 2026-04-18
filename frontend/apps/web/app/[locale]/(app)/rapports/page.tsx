'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import GridViewIcon         from '@mui/icons-material/GridView';
import ShoppingCartIcon     from '@mui/icons-material/ShoppingCart';
import CategoryIcon         from '@mui/icons-material/Category';
import InventoryIcon        from '@mui/icons-material/Inventory';
import PeopleIcon           from '@mui/icons-material/People';
import LocalShippingIcon    from '@mui/icons-material/LocalShipping';
import CompareArrowsIcon    from '@mui/icons-material/CompareArrows';
import DescriptionIcon      from '@mui/icons-material/Description';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import * as XLSX from 'xlsx';
import { PeriodProvider, usePeriod } from '@/modules/rapports/context/PeriodContext';
import { PERIOD_LABELS } from '@/modules/rapports/utils/formatters';

import GlobalControlsBar          from '@/modules/rapports/components/GlobalControlsBar';
import { useRapportsOverview }    from '@/modules/rapports/hooks/useRapportsOverview';
import { useRapportsVentes }      from '@/modules/rapports/hooks/useRapportsVentes';
import { useRapportsProduits }    from '@/modules/rapports/hooks/useRapportsProduits';
import { useRapportsInventaire }  from '@/modules/rapports/hooks/useRapportsInventaire';
import { useRapportsClients }     from '@/modules/rapports/hooks/useRapportsClients';
import { useRapportsAppro }       from '@/modules/rapports/hooks/useRapportsAppro';
import { useRapportsCrossModule } from '@/modules/rapports/hooks/useRapportsCrossModule';
import OverviewTab            from '@/modules/rapports/components/tabs/OverviewTab';
import VentesOMSTab           from '@/modules/rapports/components/tabs/VentesOMSTab';
import ProduitsCatalogueTab   from '@/modules/rapports/components/tabs/ProduitsCatalogueTab';
import InventaireStockTab     from '@/modules/rapports/components/tabs/InventaireStockTab';
import ClientsCRMTab          from '@/modules/rapports/components/tabs/ClientsCRMTab';
import ApprovisionnementTab   from '@/modules/rapports/components/tabs/ApprovisionnementTab';
import CrossModuleTab         from '@/modules/rapports/components/tabs/CrossModuleTab';

// â”€â”€â”€ Tab config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const TABS = [
  { label: "Vue d'Ensemble", icon: <GridViewIcon sx={{ fontSize: 18 }} />, badge: null },
  { label: 'Ventes & OMS',   icon: <ShoppingCartIcon sx={{ fontSize: 18 }} />, badge: 'COD' },
  { label: 'Produits & Catalogue', icon: <CategoryIcon sx={{ fontSize: 18 }} />, badge: null },
  { label: 'Inventaire & Stock',   icon: <InventoryIcon sx={{ fontSize: 18 }} />, badge: null },
  { label: 'Clients & CRM',       icon: <PeopleIcon sx={{ fontSize: 18 }} />, badge: null },
  { label: 'Approvisionnement',   icon: <LocalShippingIcon sx={{ fontSize: 18 }} />, badge: null },
  { label: 'Cross-Module',        icon: <CompareArrowsIcon sx={{ fontSize: 18 }} />, badge: 'NEW' },
];

const BADGE_COLORS: Record<string, 'warning' | 'info'> = {
  COD: 'warning',
  NEW: 'info',
};

// â”€â”€â”€ Executive View Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ExecutiveModal({ open, onClose, onOpenFull }: { open: boolean; onClose: () => void; onOpenFull?: () => void }) {
  const kpis = [
    { label: 'CA Mensuel',     value: '12.5M DA' },
    { label: 'Marge Brute',    value: '34.2%' },
    { label: 'Commandes',      value: '1,847' },
    { label: 'Taux Livraison', value: '68.5%' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <GridViewIcon color="primary" />
        Vue Executive
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Accédez à une vue condensée des KPIs essentiels pour la direction.
        </Typography>

        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Tableau de bord exécutif
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cette vue affiche uniquement les métriques clés : CA, Marge, Commandes, Taux de livraison et alertes critiques.
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {kpis.map((kpi) => (
            <Box key={kpi.label} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">{kpi.label}</Typography>
              <Typography variant="h6" fontWeight={700}>{kpi.value}</Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
        <Button variant="contained" onClick={onOpenFull ?? onClose}>Ouvrir Vue Complète</Button>
      </DialogActions>
    </Dialog>
  );
}

// â”€â”€â”€ Rapport Direction Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const REPORT_FORMATS = [
  { value: 'pdf',   label: 'PDF – Document portable' },
  { value: 'excel', label: 'Excel – Tableau de données' },
  { value: 'pptx',  label: 'PowerPoint – Présentation' },
];

const REPORT_MODULES = [
  { key: 'overview',   label: "Vue d'ensemble" },
  { key: 'ventes',     label: 'Ventes & OMS' },
  { key: 'produits',   label: 'Produits & Catalogue' },
  { key: 'inventaire', label: 'Inventaire' },
  { key: 'crm',        label: 'CRM' },
  { key: 'appro',      label: 'Approvisionnement' },
];

function RapportDirectionModal({
  open,
  onClose,
  onGenerate,
  generating,
}: {
  open: boolean;
  onClose: () => void;
  onGenerate: (format: string, modules: Record<string, boolean>) => void;
  generating: boolean;
}) {
  const [format, setFormat] = React.useState('pdf');
  const [modules, setModules] = React.useState<Record<string, boolean>>({
    overview: true,
    ventes: true,
    produits: true,
    inventaire: true,
    crm: false,
    appro: false,
  });

  const toggleModule = (key: string) =>
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DescriptionIcon color="primary" />
        Générer Rapport Direction
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Créez un rapport personnalisé pour la direction avec les données sélectionnées.
        </Typography>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>Format du rapport</Typography>
        <Select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          size="small"
          fullWidth
          sx={{ mb: 3 }}
        >
          {REPORT_FORMATS.map((f) => (
            <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
          ))}
        </Select>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>Modules à inclure</Typography>
        <FormGroup sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', mb: 3 }}>
          {REPORT_MODULES.map((m) => (
            <FormControlLabel
              key={m.key}
              control={<Checkbox checked={modules[m.key]} onChange={() => toggleModule(m.key)} size="small" />}
              label={<Typography variant="body2">{m.label}</Typography>}
            />
          ))}
        </FormGroup>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>Période du rapport</Typography>
        <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2">1 Janvier 2024 – 31 Janvier 2024</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <DescriptionIcon />} onClick={() => onGenerate(format, modules)} disabled={generating}>
          Générer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// â”€â”€â”€ Main Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function RapportsContent() {
  const [activeTab, setActiveTab] = React.useState(0);
  const { period } = usePeriod();

  const overviewResult   = useRapportsOverview(period, true);
  const ventesResult     = useRapportsVentes(period, true);
  const produitsResult   = useRapportsProduits(period, true);
  const inventaireResult = useRapportsInventaire(period, true);
  const clientsResult    = useRapportsClients(period, true);
  const approResult      = useRapportsAppro(period, true);
  const crossResult      = useRapportsCrossModule(period, true);

  // Modal states
  const [executiveOpen, setExecutiveOpen] = React.useState(false);
  const [rapportOpen, setRapportOpen]     = React.useState(false);
  const [snackbar, setSnackbar]           = React.useState<string | null>(null);
  const [generating, setGenerating]         = React.useState(false);

  const exportData = React.useMemo(() => ({
    overview:    overviewResult.data?.data,
    ventes:      ventesResult.data?.data,
    produits:    produitsResult.data?.data,
    inventaire:  inventaireResult.data?.data,
    clients:     clientsResult.data?.data,
    appro:       approResult.data?.data,
    crossModule: crossResult.data?.data,
    periodLabel: PERIOD_LABELS[period] ?? period,
  }), [overviewResult.data, ventesResult.data, produitsResult.data, inventaireResult.data, clientsResult.data, approResult.data, crossResult.data, period]);


  // Map modal module keys → exportData keys
  const MODULE_DATA_MAP: Record<string, keyof typeof exportData> = {
    overview:   'overview',
    ventes:     'ventes',
    produits:   'produits',
    inventaire: 'inventaire',
    crm:        'clients',
    appro:      'appro',
  };

  const downloadBlob = (filename: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async (format: string, modules: Record<string, boolean>) => {
    setRapportOpen(false);
    setGenerating(true);
    setSnackbar('Rapport en cours de génération...');

    const stamp       = new Date().toISOString().slice(0, 10);
    const periodLabel = PERIOD_LABELS[period] ?? period;
    const selected    = Object.entries(modules).filter(([, on]) => on).map(([k]) => k);

    try {
      if (format === 'excel') {
        const wb = XLSX.utils.book_new();
        selected.forEach((modKey) => {
          const dataKey = MODULE_DATA_MAP[modKey];
          const data    = exportData[dataKey];
          if (!data) return;
          // Each top-level array in the module data becomes a sheet
          Object.entries(data).forEach(([name, val]) => {
            if (Array.isArray(val) && val.length > 0) {
              const sheet = XLSX.utils.json_to_sheet(val as object[]);
              XLSX.utils.book_append_sheet(wb, sheet, `${modKey}-${name}`.slice(0, 31));
            }
          });
        });
        const xlsData = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
        downloadBlob(
          `rapport-direction-${stamp}.xlsx`,
          new Blob([xlsData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        );
      } else if (format === 'csv') {
        const csvCell = (v: any) => (v == null ? '' : `"${String(v).replace(/"/g, '""')}"`);
        const lines: string[] = [`Rapport Direction — ${periodLabel}`, ''];
        selected.forEach((modKey) => {
          const dataKey = MODULE_DATA_MAP[modKey];
          const data    = exportData[dataKey];
          if (!data) return;
          Object.entries(data).forEach(([name, val]) => {
            if (Array.isArray(val) && val.length > 0) {
              const headers = Object.keys((val as any[])[0]);
              lines.push(`## ${modKey} / ${name}`);
              lines.push(headers.map(csvCell).join(','));
              (val as any[]).forEach((row) => lines.push(headers.map((h) => csvCell(row[h])).join(',')));
              lines.push('');
            }
          });
        });
        downloadBlob(
          `rapport-direction-${stamp}.csv`,
          new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' }),
        );
      } else {
        // pdf or pptx → generate a real PDF with jsPDF
        const { jsPDF }   = await import('jspdf');
        const autoTable   = (await import('jspdf-autotable')).default;
        const doc         = new jsPDF();
        doc.setFontSize(18);
        doc.text('Rapport Direction', 14, 18);
        doc.setFontSize(10);
        doc.text(`Période : ${periodLabel}`, 14, 26);
        doc.text(`Modules : ${selected.join(', ') || 'aucun'}`, 14, 32);
        doc.text(`Généré le : ${new Date().toLocaleString()}`, 14, 38);

        let y = 46;
        for (const modKey of selected) {
          const dataKey = MODULE_DATA_MAP[modKey];
          const data    = exportData[dataKey];
          if (!data) continue;
          for (const [name, val] of Object.entries(data)) {
            if (!Array.isArray(val) || val.length === 0) continue;
            const headers = Object.keys((val as any[])[0]);
            if (y > 240) { doc.addPage(); y = 14; }
            doc.setFontSize(11);
            doc.text(`${modKey} — ${name}`, 14, y);
            y += 4;
            autoTable(doc, {
              startY: y,
              head:   [headers],
              body:   (val as any[]).map((row) => headers.map((h) => row[h] ?? '')),
              styles: { fontSize: 8 },
            });
            y = (doc as any).lastAutoTable.finalY + 8;
          }
        }

        const ext = format === 'pptx' ? 'pdf' : format;
        downloadBlob(`rapport-direction-${stamp}.${ext}`, doc.output('blob'));
      }
    } finally {
      setGenerating(false);
    }
  };


  return (
    <Box>
      {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Rapports &amp; Analytiques
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5} mt={0.5} flexWrap="wrap">
            <Chip
              label="MVP — 6 modules"
              size="small"
              color="success"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: 11 }}
            />
            <Typography variant="body2" color="text.secondary">
              · Période: {PERIOD_LABELS[period] ?? period}
            </Typography>
            <FiberManualRecordIcon sx={{ fontSize: 8, color: 'success.main', ml: 0.5 }} />
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
              Données en temps réel
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={1} flexShrink={0}>
          <Button
            variant="outlined"
            startIcon={<GridViewIcon />}
            onClick={() => setExecutiveOpen(true)}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
          >
            Vue Executive
          </Button>
          <Button
            variant="contained"
            startIcon={<DescriptionIcon />}
            onClick={() => setRapportOpen(true)}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
          >
            Générer Rapport Direction
          </Button>
        </Box>
      </Box>

      {/* â”€â”€ Global controls â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <GlobalControlsBar exportData={exportData} activeTab={activeTab} />

      {/* â”€â”€ Tab navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Tabs
        value={activeTab}
        onChange={(_e, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        TabIndicatorProps={{ sx: { display: 'none' } }}
        sx={{ mb: 2, minHeight: 44 }}
      >
        {TABS.map((tab, i) => (
          <Tab
            key={tab.label}
            label={
              <Box display="flex" alignItems="center" gap={0.75}>
                {tab.icon}
                {tab.label}
                {tab.badge && (
                  <Chip
                    label={tab.badge}
                    size="small"
                    color={BADGE_COLORS[tab.badge] ?? 'default'}
                    sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                  />
                )}
              </Box>
            }
            sx={{
              textTransform: 'none',
              fontWeight: activeTab === i ? 700 : 400,
              minHeight: 44,
              borderRadius: 2,
              mx: 0.25,
              px: 2,
              ...(activeTab === i && {
                bgcolor: 'primary.main',
                color: '#fff !important',
                '& .MuiChip-root': { bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' },
                '& .MuiSvgIcon-root': { color: '#fff' },
              }),
            }}
          />
        ))}
      </Tabs>

      {/* â”€â”€ Tab content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {activeTab === 0 && <OverviewTab period={period} />}
      {activeTab === 1 && <VentesOMSTab period={period} />}
      {activeTab === 2 && <ProduitsCatalogueTab period={period} />}
      {activeTab === 3 && <InventaireStockTab period={period} />}
      {activeTab === 4 && <ClientsCRMTab period={period} />}
      {activeTab === 5 && <ApprovisionnementTab period={period} />}
      {activeTab === 6 && <CrossModuleTab period={period} />}

      {/* â”€â”€ Modals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <ExecutiveModal open={executiveOpen} onClose={() => setExecutiveOpen(false)} onOpenFull={() => { setExecutiveOpen(false); setActiveTab(0); }} />
      <RapportDirectionModal
        open={rapportOpen}
        onClose={() => setRapportOpen(false)}
        onGenerate={handleGenerate}
        generating={generating}
      />

      {/* â”€â”€ Snackbar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
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

export default function RapportsPage() {
  return (
    <PeriodProvider>
      <RapportsContent />
    </PeriodProvider>
  );
}
