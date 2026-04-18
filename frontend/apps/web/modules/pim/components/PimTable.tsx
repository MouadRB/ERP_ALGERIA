'use client';
// apps/web/modules/pim/components/PimTable.tsx
import { useEffect, useState, useTransition, useCallback, useRef } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TableSortLabel,
  InputBase, Stack, MenuItem, Select, Typography, Avatar, Chip,
  IconButton, Tooltip, Button, Skeleton, Checkbox, Slide, Snackbar,
  Menu, ListItemText, ListItemIcon, Divider,
} from '@mui/material';
import SearchIcon              from '@mui/icons-material/Search';
import VisibilityOutlinedIcon  from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon        from '@mui/icons-material/EditOutlined';
import ContentCopyIcon         from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon       from '@mui/icons-material/DeleteOutline';
import SwapHorizIcon           from '@mui/icons-material/SwapHoriz';
import MoreVertIcon            from '@mui/icons-material/MoreVert';
import GridViewIcon            from '@mui/icons-material/GridView';
import ViewListIcon            from '@mui/icons-material/ViewList';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import LockOutlinedIcon        from '@mui/icons-material/LockOutlined';
import CheckCircleOutlineIcon  from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon        from '@mui/icons-material/WarningAmber';
import KeyboardArrowDownIcon   from '@mui/icons-material/KeyboardArrowDown';
import { useRouter }           from 'next/navigation';
import { alpha }               from '@mui/material/styles';

import type { Product, ProductListMeta } from './pim.types';
import { getTotalStock, getTvaLabel, formatDZD } from './pim.helpers';
import PimStatusBadge from './PimStatusBadge';
import BulkExportModal from './modals/bulk/BulkExportModal';
import BulkChangeStatusModal from './modals/bulk/BulkChangeStatusModal';
import BulkChangeTvaModal from './modals/bulk/BulkChangeTvaModal';
import BulkChangeSupplierModal from './modals/bulk/BulkChangeSupplierModal';
import BulkPlanReapproModal from './modals/bulk/BulkPlanReapproModal';
import ConfirmDeleteProductModal from './modals/ConfirmDeleteProductModal';
import { useCreateProduct } from '../hooks/useCreateProduct';

type BulkModalKey = 'export' | 'status' | 'tva' | 'supplier' | 'reappro' | null;

interface Props {
  products: Product[];
  meta: ProductListMeta;
  locale: string;
  currentParams: Record<string, string>;
  onParamsChange: (p: Record<string, string>) => void;
  loading?: boolean;
}

const CATEGORIES = ['Électronique', 'Mode', 'Maison', 'Beauté', 'Sport', 'Alimentation'];
const FOURNISSEURS = ['Samsung DZ', 'Nike MENA', 'Xiaomi DZ', 'Adidas', 'Apple MENA'];
const STATUTS = [
  { value: 'active', label: 'Actif' },
  { value: 'draft', label: 'Brouillon' },
  { value: 'discontinued', label: 'Discontinué' },
  { value: 'signaled', label: 'Signalé' },
  { value: 'ocr_import', label: 'Import OCR' },
];

const normalizeCategoryValue = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return '';

  const lower = normalized.toLowerCase();
  const compact = lower.replace(/[^a-z]/g, '');
  if (
    compact.includes('electronique') ||
    compact.endsWith('lectronique') ||
    lower.includes('lectronique')
  ) {
    return 'Electronique';
  }
  if (compact.includes('beaute') || compact.includes('beaut')) {
    return 'Beaute';
  }
  return normalized;
};

function FilterDropdown({ label, value, options, onChange }: {
  label: string; value: string;
  options: { value: string; label: string }[] | string[];
  onChange: (v: string) => void;
}) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const items = options
    .map((option) => (typeof option === 'string' ? { value: option, label: option } : option))
    .map((option) => ({
      ...option,
      value: normalizeCategoryValue(option.value),
      label: normalizeCategoryValue(option.label),
    }));
  const selectedValue = normalizeCategoryValue(value);
  const current = items.find((item) => item.value === selectedValue);

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          textTransform: 'none', fontWeight: 500, fontSize: '0.82rem',
          borderColor: selectedValue ? 'primary.main' : 'divider', borderRadius: '8px',
          color: selectedValue ? 'primary.main' : 'text.secondary',
          bgcolor: (t) => selectedValue ? alpha(t.palette.primary.main, 0.15) : t.palette.background.paper,
          px: 1.5, py: 0.6, whiteSpace: 'nowrap',
          '&:hover': { borderColor: 'primary.main', bgcolor: (t) => alpha(t.palette.primary.main, 0.15) },
        }}
      >
        {current?.label ?? label}
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', minWidth: 160 } }}>
        <MenuItem onClick={() => { onChange(''); setAnchor(null); }}>
          <ListItemText primary={<Typography variant="body2" fontWeight={selectedValue === '' ? 700 : 400} sx={{ color: selectedValue === '' ? 'primary.main' : 'text.primary' }}>{label}</Typography>} />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        {items.map((item) => (
          <MenuItem key={item.value} onClick={() => { onChange(item.value); setAnchor(null); }}
            sx={{ bgcolor: (t) => selectedValue === item.value ? alpha(t.palette.primary.main, 0.15) : 'transparent' }}>
            <ListItemText primary={<Typography variant="body2" fontWeight={selectedValue === item.value ? 700 : 400} sx={{ color: selectedValue === item.value ? 'primary.main' : 'text.primary' }}>{item.label}</Typography>} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function StockCell({ product }: { product: Product }) {
  if (product.variants.length === 0) return <Typography variant="body2" color="text.secondary">— / {product.stockSeuil ?? '—'}</Typography>;
  const total = getTotalStock(product);
  const seuil = product.stockSeuil ?? 0;
  const isRupture = total === 0;
  const isFaible  = !isRupture && total < seuil;
  return (
    <Box>
      <Typography variant="body2" fontWeight={600} sx={{ color: isRupture ? '#f85149' : isFaible ? '#d29922' : 'text.primary' }}>
        {total} / {seuil}
      </Typography>
      {isRupture && <Chip label="RUPTURE" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: 'rgba(248,81,73,0.08)', color: 'error.main', border: '1px solid #fca5a5' }} />}
      {isFaible  && <Chip label="Faible"  size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: 'rgba(210,153,34,0.12)', color: 'warning.main', border: '1px solid #d29922' }} />}
    </Box>
  );
}

function ReturnRateCell({ rate }: { rate?: number }) {
  if (rate === undefined || rate === null) return <Typography variant="body2" color="text.secondary">—</Typography>;
  const pct = Math.round(rate * 100);
  const color = pct >= 30 ? '#f85149' : pct >= 20 ? '#d29922' : '#2ea043';
  const barColor = pct >= 30 ? '#f85149' : pct >= 20 ? '#fd8c73' : '#2ea043';
  return (
    <Box>
      <Typography variant="body2" fontWeight={700} sx={{ color }}>{pct}%</Typography>
      <Box sx={{ width: 40, height: 3, bgcolor: 'action.hover', borderRadius: 2, mt: 0.3 }}>
        <Box sx={{ width: `${Math.min(pct, 100)}%`, height: '100%', bgcolor: barColor, borderRadius: 2 }} />
      </Box>
      {pct >= 30 && <Chip label="⚠ Signalé" size="small" sx={{ height: 16, fontSize: '0.58rem', fontWeight: 700, bgcolor: (t) => alpha(t.palette.error.main, 0.12), color: 'error.main', mt: 0.3, border: '1px solid', borderColor: 'error.main' }} />}
    </Box>
  );
}

export default function PimTable({ products, meta, locale, currentParams, onParamsChange, loading = false }: Props) {
  const router             = useRouter();
  const [pend, startTrans] = useTransition();
  const [selected, setSel] = useState<string[]>([]);
  const [search,   setSearch] = useState(currentParams.search ?? '');

  // Bulk modals
  const [activeBulk, setActiveBulk] = useState<BulkModalKey>(null);

  // Row actions menu
  const [rowMenuAnchor, setRowMenuAnchor] = useState<HTMLElement | null>(null);
  const [rowMenuProduct, setRowMenuProduct] = useState<Product | null>(null);
  const [singleStatusOpen, setSingleStatusOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Feedback
  const [toast, setToast] = useState('');
  const createProduct = useCreateProduct();

  const showToast = (message: string) => setToast(message);
  const closeRowMenu = () => {
    setRowMenuAnchor(null);
    setRowMenuProduct(null);
  };

  const handleRowMenuOpen = (event: React.MouseEvent<HTMLElement>, product: Product) => {
    event.stopPropagation();
    setRowMenuAnchor(event.currentTarget);
    setRowMenuProduct(product);
  };

  const handleDuplicate = async () => {
    if (!rowMenuProduct) return;
    const source = rowMenuProduct;
    closeRowMenu();
    try {
      await createProduct.mutateAsync({
        nameFr: `${source.nameFr} (copie)`,
        nameAr: source.nameAr,
        categoryId: source.categoryId,
        brandId: source.brandId,
        supplierName: source.supplierName,
        supplierRef: source.supplierRef,
        priceHT: source.priceHT,
        priceTTC: source.priceTTC,
        costFifo: source.costFifo,
        tvaRate: source.tvaRate,
        status: 'draft',
        stockSeuil: source.stockSeuil,
      } as any);
      showToast('Produit dupliqué (brouillon).');
    } catch (err) {
      showToast((err as Error).message || 'Échec de la duplication.');
    }
  };

  const status      = currentParams.status      ?? '';
  const categoryId  = normalizeCategoryValue(currentParams.categoryId ?? '');
  const supplier    = currentParams.supplier    ?? '';
  const page        = parseInt(currentParams.page     ?? '1') - 1;
  const pageSize    = parseInt(currentParams.pageSize ?? '20');
  const sortBy      = currentParams.sortBy      ?? 'updatedAt';
  const sortOrder   = (currentParams.sortOrder as 'asc' | 'desc') ?? 'desc';

  const push = useCallback((patch: Record<string, string>) => {
    const nextPatch = { ...patch };
    if ('categoryId' in nextPatch) {
      nextPatch.categoryId = normalizeCategoryValue(nextPatch.categoryId);
    }
    startTrans(() => onParamsChange({ ...currentParams, ...nextPatch, page: '1' }));
  }, [currentParams, onParamsChange]);

  useEffect(() => {
    setSearch(currentParams.search ?? '');
  }, [currentParams.search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search !== (currentParams.search ?? '')) {
        push({ search });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [currentParams.search, push, search]);

  const handleSort = (col: string) => {
    startTrans(() => onParamsChange({
      ...currentParams, sortBy: col,
      sortOrder: sortBy === col && sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const toggleOne = (id: string) => setSel((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const toggleAll = () => setSel(selected.length === products.length ? [] : products.map((p) => p.id));
  const isLoading = loading || pend;

  return (
    <Box>
      {/* ── Barre filtres ── */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" mb={2} flexWrap="wrap">
        {/* Search */}
        <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: '8px', px: 1.5, py: 0.5, bgcolor: 'background.default', flex: { sm: 1 }, minWidth: 200, '&:focus-within': { borderColor: '#58a6ff', boxShadow: '0 0 0 2px rgba(88,166,255,0.2)' } }}>
          <SearchIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 0.75 }} />
          <InputBase
            placeholder="Rechercher par nom FR/AR, SKU, code-barres, ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && push({ search })}
            sx={{ fontSize: '0.82rem', flex: 1 }}
          />
        </Box>

        <FilterDropdown label="Toutes les catégories" value={categoryId} options={CATEGORIES} onChange={(v) => push({ categoryId: v })} />
        <FilterDropdown label="Tous les statuts"      value={status}     options={STATUTS}    onChange={(v) => push({ status: v })} />
        <FilterDropdown label="Tous les fournisseurs" value={supplier}   options={FOURNISSEURS} onChange={(v) => push({ supplier: v })} />

        <Box flex={1} />
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', p: 0.75, color: 'text.secondary' }}><GridViewIcon fontSize="small" /></IconButton>
          <IconButton size="small" sx={{ border: '1px solid #58a6ff', borderRadius: '8px', p: 0.75, color: 'primary.main', bgcolor: 'rgba(88,166,255,0.15)' }}><ViewListIcon fontSize="small" /></IconButton>
        </Stack>
      </Stack>

      {/* ── Table ── */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.paper' }}>
                <TableCell padding="checkbox">
                  <Checkbox size="small"
                    checked={selected.length === products.length && products.length > 0}
                    indeterminate={selected.length > 0 && selected.length < products.length}
                    onChange={toggleAll}
                  />
                </TableCell>
                {[
                  { id: 'image',       label: 'IMAGE',            sort: false },
                  { id: 'nameFr',      label: 'PRODUIT (FR/AR)',  sort: true  },
                  { id: 'sku',         label: 'SKU — MDM',        sort: false },
                  { id: 'supplier',    label: 'FOURNISSEUR',      sort: false },
                  { id: 'categoryId',  label: 'CATÉGORIE',        sort: false },
                  { id: 'priceTTC',    label: 'PRIX VENTE',       sort: true  },
                  { id: 'costFifo',    label: 'PRIX COÛT 🔒',     sort: false },
                  { id: 'tva',         label: 'TVA',              sort: false },
                  { id: 'returnRate',  label: 'TAUX RETOUR',      sort: false },
                  { id: 'status',      label: 'STATUT',           sort: false },
                  { id: 'actions',     label: 'ACTIONS',          sort: false },
                ].map((col) => (
                  <TableCell key={col.id} sx={{ fontWeight: 700, fontSize: '0.68rem', color: 'text.secondary', py: 1.5, whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>
                    {col.sort ? (
                      <TableSortLabel active={sortBy === col.id} direction={sortBy === col.id ? sortOrder : 'asc'} onClick={() => handleSort(col.id)}>
                        {col.label}
                      </TableSortLabel>
                    ) : col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading
                ? Array.from({ length: Math.min(pageSize, 8) }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 12 }).map((_, j) => (
                        <TableCell key={j}><Skeleton variant="text" width="80%" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : products.map((p) => {
                    const isSignaled = p.signaled || (p.returnRate !== undefined && p.returnRate >= 0.3);
                    return (
                      <TableRow
                        key={p.id}
                        hover
                        selected={selected.includes(p.id)}
                        sx={{
                          cursor: 'pointer',
                          '&:last-child td': { border: 0 },
                          '& td': { py: 0.75 },
                          borderLeft: isSignaled ? '3px solid #f43f5e' : '3px solid transparent',
                        }}
                        onClick={() => router.push(`/${locale}/pim/${p.id}`)}
                      >
                        <TableCell padding="checkbox" onClick={(e) => { e.stopPropagation(); toggleOne(p.id); }}>
                          <Checkbox size="small" checked={selected.includes(p.id)} />
                        </TableCell>

                        {/* Image */}
                        <TableCell>
                          <Avatar src={p.mediaUrls?.[0]} variant="rounded" sx={{ width: 44, height: 44, bgcolor: 'rgba(139,148,158,0.15)', borderRadius: 1.5 }}>
                            <BrokenImageOutlinedIcon fontSize="small" sx={{ color: '#30363d' }} />
                          </Avatar>
                        </TableCell>

                        {/* Produit FR/AR + tags */}
                        <TableCell sx={{ maxWidth: 260 }}>
                          <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: '0.85rem' }}>{p.nameFr}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap display="block" dir="rtl" textAlign="right" sx={{ fontSize: '0.72rem' }}>
                            {p.nameAr}
                          </Typography>
                          <Stack direction="row" spacing={0.5} mt={0.25} flexWrap="wrap">
                            {p.variants.length > 0 && (
                              <Chip label={`${p.variants.length} variante${p.variants.length > 1 ? 's' : ''}`} size="small"
                                sx={{ height: 18, fontSize: '0.62rem', bgcolor: 'rgba(88,166,255,0.15)', color: 'primary.main', border: '1px solid #58a6ff' }} />
                            )}
                            {p.wilayasRestreintes && p.wilayasRestreintes.length > 0 && (
                              <Chip label={`⚠ ${p.wilayasRestreintes.length} wilayas restreintes`} size="small"
                                sx={{ height: 18, fontSize: '0.62rem', bgcolor: 'rgba(253,140,115,0.08)', color: 'warning.main', border: '1px solid #fed7aa' }} />
                            )}
                            {p.returnPolicy && (
                              <Chip label={`↩ ${p.returnPolicy}`} size="small"
                                sx={{ height: 18, fontSize: '0.62rem', bgcolor: 'background.paper', color: 'text.secondary', border: '1px solid', borderColor: 'divider' }} />
                            )}
                          </Stack>
                        </TableCell>

                        {/* SKU + MDM */}
                        <TableCell>
                          <Typography variant="caption" fontFamily="monospace" fontWeight={700}
                            sx={{ color: p.status === 'draft' ? '#d29922' : '#58a6ff', bgcolor: p.status === 'draft' ? 'rgba(210,153,34,0.12)' : 'rgba(88,166,255,0.15)', px: 0.75, py: 0.2, borderRadius: '4px', display: 'block', whiteSpace: 'nowrap', border: `1px solid ${p.status === 'draft' ? '#d29922' : '#58a6ff'}` }}>
                            {p.sku}
                          </Typography>
                          {p.mdmConfirmed && (
                            <Stack direction="row" alignItems="center" spacing={0.3} mt={0.25}>
                              <CheckCircleOutlineIcon sx={{ fontSize: 11, color: 'success.main' }} />
                              <Typography variant="caption" sx={{ color: 'success.main', fontSize: '0.62rem', fontWeight: 600 }}>MDM ✓</Typography>
                            </Stack>
                          )}
                        </TableCell>

                        {/* Fournisseur */}
                        <TableCell sx={{ minWidth: 130 }}>
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.82rem' }}>{p.supplierName ?? p.brandId}</Typography>
                          {p.supplierRef && <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>RÉF: {p.supplierRef}</Typography>}
                        </TableCell>

                        {/* Catégorie */}
                        <TableCell>
                          <Chip label={p.categoryId} size="small" sx={{ bgcolor: 'rgba(139,148,158,0.15)', fontSize: '0.72rem', fontWeight: 500, border: '1px solid', borderColor: 'divider' }} />
                        </TableCell>

                        {/* Prix TTC */}
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Typography variant="body2" fontWeight={700}>{formatDZD(p.priceTTC)}</Typography>
                        </TableCell>

                        {/* Prix Coût FIFO 🔒 */}
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {p.costFifo ? (
                            <Stack direction="row" alignItems="center" spacing={0.4}>
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{p.costFifo.toLocaleString('fr-DZ')} DZD</Typography>
                              <LockOutlinedIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                            </Stack>
                          ) : (
                            <Stack direction="row" alignItems="center" spacing={0.4}>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>—</Typography>
                              <LockOutlinedIcon sx={{ fontSize: 12, color: '#30363d' }} />
                            </Stack>
                          )}
                        </TableCell>

                        {/* TVA */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{getTvaLabel(p.tvaRate)}</Typography>
                        </TableCell>

                        {/* Taux Retour */}
                        <TableCell><ReturnRateCell rate={p.returnRate} /></TableCell>

                        {/* Statut */}
                        <TableCell>
                          <Box>
                            <PimStatusBadge status={p.status} />
                            {p.status === 'draft' && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.62rem', display: 'block', mt: 0.25 }}>
                                Activation: Inventory Mgr
                              </Typography>
                            )}
                            {p.status === 'discontinued' && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.62rem', display: 'block', mt: 0.25 }}>
                                Conservation 10 ans (Loi fiscale)
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        {/* Actions */}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Stack direction="row" spacing={0.25}>
                            <Tooltip title="Voir"><IconButton size="small" onClick={() => router.push(`/${locale}/pim/${p.id}?mode=view`)}><VisibilityOutlinedIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                            <Tooltip title="Modifier"><IconButton size="small" onClick={() => router.push(`/${locale}/pim/${p.id}`)}><EditOutlinedIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                            <Tooltip title="Plus"><IconButton size="small" onClick={(e) => handleRowMenuOpen(e, p)}><MoreVertIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
              }
              {!isLoading && products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Aucun produit trouvé</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div" count={meta.total} page={page} rowsPerPage={pageSize}
          rowsPerPageOptions={[10, 20, 50]}
          onPageChange={(_, p) => startTrans(() => onParamsChange({ ...currentParams, page: String(p + 1) }))}
          onRowsPerPageChange={(e) => startTrans(() => onParamsChange({ ...currentParams, pageSize: e.target.value, page: '1' }))}
          labelRowsPerPage="Par page" labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
        />
      </Paper>

      {/* ── Barre actions groupées ── */}
      <Slide direction="up" in={selected.length > 0} mountOnEnter unmountOnExit>
        <Box sx={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          bgcolor: '#1e3a5f', borderRadius: '12px', px: 3, py: 1.5,
          display: 'flex', alignItems: 'center', gap: 1.5,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', zIndex: 1300,
        }}>
          <Typography variant="body2" fontWeight={600} sx={{ color: 'primary.main', mr: 0.5 }}>
            {selected.length} produit{selected.length > 1 ? 's' : ''} sélectionné{selected.length > 1 ? 's' : ''}
          </Typography>
          {([
            { key: 'export',   label: 'Exporter' },
            { key: 'status',   label: 'Changer Statut' },
            { key: 'tva',      label: 'Changer TVA' },
            { key: 'supplier', label: 'Changer Fournisseur' },
            { key: 'reappro',  label: 'Planifier Réappro.' },
          ] as const).map((action) => (
            <Button
              key={action.key}
              size="small"
              onClick={() => setActiveBulk(action.key)}
              sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', borderRadius: '8px', px: 1.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
            >
              {action.label}
            </Button>
          ))}
          <Button size="small" onClick={() => setSel([])} sx={{ color: 'primary.main', textTransform: 'none', fontSize: '0.75rem' }}>✕</Button>
        </Box>
      </Slide>

      {/* ── Row action menu (3-dots) ── */}
      <Menu anchorEl={rowMenuAnchor} open={Boolean(rowMenuAnchor)} onClose={closeRowMenu}>
        <MenuItem
          onClick={() => {
            if (rowMenuProduct) router.push(`/${locale}/pim/${rowMenuProduct.id}?mode=view`);
            closeRowMenu();
          }}
        >
          <ListItemIcon><VisibilityOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Voir détails</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicate} disabled={createProduct.isPending}>
          <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Dupliquer</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setSingleStatusOpen(true);
            setRowMenuAnchor(null);
          }}
        >
          <ListItemIcon><SwapHorizIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Changer statut</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setDeleteTarget(rowMenuProduct);
            setRowMenuAnchor(null);
          }}
          sx={{ color: 'warning.main' }}
        >
          <ListItemIcon><DeleteOutlineIcon fontSize="small" sx={{ color: 'warning.main' }} /></ListItemIcon>
          <ListItemText>Archiver</ListItemText>
        </MenuItem>
      </Menu>

      {/* ── Bulk modals ── */}
      <BulkExportModal
        open={activeBulk === 'export'}
        onClose={() => setActiveBulk(null)}
        selectedIds={selected}
        onDone={(message) => { showToast(message); setSel([]); }}
      />
      <BulkChangeStatusModal
        open={activeBulk === 'status'}
        onClose={() => setActiveBulk(null)}
        ids={selected}
        onDone={(message) => { showToast(message); setSel([]); }}
      />
      <BulkChangeTvaModal
        open={activeBulk === 'tva'}
        onClose={() => setActiveBulk(null)}
        ids={selected}
        onDone={(message) => { showToast(message); setSel([]); }}
      />
      <BulkChangeSupplierModal
        open={activeBulk === 'supplier'}
        onClose={() => setActiveBulk(null)}
        ids={selected}
        onDone={(message) => { showToast(message); setSel([]); }}
      />
      <BulkPlanReapproModal
        open={activeBulk === 'reappro'}
        onClose={() => setActiveBulk(null)}
        ids={selected}
        onDone={(message) => { showToast(message); setSel([]); }}
      />

      {/* ── Row action modals ── */}
      <BulkChangeStatusModal
        open={singleStatusOpen}
        onClose={() => {
          setSingleStatusOpen(false);
          setRowMenuProduct(null);
        }}
        ids={rowMenuProduct ? [rowMenuProduct.id] : []}
        onDone={(message) => showToast(message)}
      />
      <ConfirmDeleteProductModal
        open={Boolean(deleteTarget)}
        onClose={() => {
          setDeleteTarget(null);
          setRowMenuProduct(null);
        }}
        productId={deleteTarget?.id ?? null}
        productName={deleteTarget?.nameFr}
        onDone={(message) => showToast(message)}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </Box>
  );
}
