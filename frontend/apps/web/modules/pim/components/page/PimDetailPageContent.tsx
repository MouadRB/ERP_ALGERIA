'use client';
// apps/web/app/[locale]/(app)/pim/[id]/page.tsx

import { useState, useEffect, useMemo,useRef } from 'react';
import {
  Box, Stack, Typography, Button, Chip, Paper,
  TextField, Tab, Tabs, IconButton, Avatar,
  Select, MenuItem, FormControl, Table, TableBody,
  DialogContent, DialogActions,TableCell, TableHead, TableRow, Alert, CircularProgress, Snackbar,Dialog, DialogTitle,
  Grid,
  Checkbox,
  FormControlLabel,
  Switch
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import StarIcon from '@mui/icons-material/Star';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LockIcon from '@mui/icons-material/Lock';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useViewMode } from '@/hooks/shared/useViewMode';

import { usePIMProduct } from '@/modules/pim/hooks/usePIMProduct';
import { useUpdateProduct } from '@/modules/pim/hooks/useUpdateProduct';
import { useCreateProduct } from '@/modules/pim/hooks/useCreateProduct';
import { useAddVariant } from '@/modules/pim/hooks/useAddVariant';
import { useManageRestrictions } from '@/modules/pim/hooks/useManageRestrictions';
import ConfirmDeleteProductModal from '@/modules/pim/components/modals/ConfirmDeleteProductModal';
import ManageRestrictionsModal from '@/modules/pim/components/modals/ManageRestrictionsModal';

// Types
interface Product {
  id: string;
  sku: string;
  nameFr: string;
  nameAr: string;
  descriptionFr: string;
  descriptionAr: string;
  categoryId: string;
  brandId?: string;
  supplierName: string;
  supplierRef: string;
  priceHT: number;
  tvaRate: 'standard' | 'reduced' | 'exempt';
  priceTTC: number;
  costFifo: number;
  status: 'active' | 'draft' | 'archived';
  signaled: boolean;
  returnRate: number;
  stockSeuil: number;
  mdmConfirmed: boolean;
  variants: any[];
  mediaUrls: string[];
  weightKg: number;
  dimensions: any;
  wilayasRestreintes: string[];
  returnPolicy: string;
  totalStock?: number;
  priceHistory?: Array<{
    timestamp: string;
    type: 'creation' | 'price_update' | 'cost_update' | string;
    fromPriceHT: number | null;
    toPriceHT: number | null;
    fromPriceTTC: number | null;
    toPriceTTC: number | null;
    by: string;
  }>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  attributes: Array<{ name: string; valueFr: string; valueAr: string; unit?: string }>;
  [key: string]: any;
}

const TVA_RATE_NUM: Record<'standard' | 'reduced' | 'exempt', number> = {
  standard: 0.19,
  reduced: 0.09,
  exempt: 0,
};

const computePriceTTC = (priceHT: number, tvaRate: 'standard' | 'reduced' | 'exempt') =>
  Math.round(priceHT * (1 + TVA_RATE_NUM[tvaRate]));

// Helper functions
const formatDate = (iso: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatRelative = (iso: string) => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "aujourd'hui";
  if (days === 1) return 'il y a 1 jour';
  return `il y a ${days} jours`;
};

export default function PimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = typeof params?.locale === 'string' ? params.locale : 'fr';
  const id = typeof params?.id === 'string' ? params.id : '';

  const { data, isLoading, error, refetch } = usePIMProduct(id);
  const updateProduct = useUpdateProduct();
  const createProduct = useCreateProduct();
  const { isReadOnly } = useViewMode();
  const [activeTab, setActiveTab] = useState(0);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [restrictionsOpen, setRestrictionsOpen] = useState(false);
  const [actionToast, setActionToast] = useState<string>('');

  const product = data?.data as Product | undefined;

  useEffect(() => {
    if (product) {
      setEditedProduct({
        ...product,
        returnPolicy: product.returnPolicy || 'Retours 7 jours',
        attributes: product.attributes || [],
        brandId: product.brandId || '',
        supplierRef: product.supplierRef || '',
      });
    }
  }, [product]);

  const handleFieldChange = (field: string, value: any) => {
    setEditedProduct((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleAttributeChange = (index: number, field: string, value: string) => {
    if (editedProduct && editedProduct.attributes) {
      const newAttributes = [...editedProduct.attributes];
      newAttributes[index] = { ...newAttributes[index], [field]: value };
      setEditedProduct({ ...editedProduct, attributes: newAttributes });
    }
  };

  const addAttribute = () => {
    if (editedProduct) {
      const newAttributes = [...(editedProduct.attributes || []), { name: '', valueFr: '', valueAr: '', unit: '' }];
      setEditedProduct({ ...editedProduct, attributes: newAttributes });
    }
  };

  const removeAttribute = (index: number) => {
    if (editedProduct && editedProduct.attributes) {
      const newAttributes = editedProduct.attributes.filter((_, i) => i !== index);
      setEditedProduct({ ...editedProduct, attributes: newAttributes });
    }
  };

  const handleSave = async () => {
    if (!editedProduct) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      await updateProduct.mutateAsync({ id, body: editedProduct });
      setSaveSuccess(true);
      await refetch();

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Erreur d’enregistrement:', err);
      setSaveError(
        (err as Error)?.message || 'Échec de l’enregistrement du produit.',
      );
      setTimeout(() => {
        setSaveError(null);
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!editedProduct) return;
    try {
      const response = await createProduct.mutateAsync({
        nameFr: `${editedProduct.nameFr} (copie)`,
        nameAr: editedProduct.nameAr,
        categoryId: editedProduct.categoryId,
        brandId: editedProduct.brandId,
        supplierName: editedProduct.supplierName,
        supplierRef: editedProduct.supplierRef,
        priceHT: editedProduct.priceHT,
        priceTTC: editedProduct.priceTTC,
        costFifo: editedProduct.costFifo,
        tvaRate: editedProduct.tvaRate,
        status: 'draft',
        stockSeuil: editedProduct.stockSeuil,
      } as any);
      setActionToast('Produit dupliqué (brouillon).');
      const newId = (response as any)?.data?.id;
      if (newId) router.push(`/${locale}/pim/${newId}`);
    } catch (err) {
      setActionToast((err as Error).message || 'Échec de la duplication.');
    }
  };

  const TABS = ['Infos Générales', 'Prix & Coûts', `Variantes (${product?.variants?.length ?? 0})`, 'Médias', 'Logistique', 'SEO & Catalogue'];

  const avatarColor = useMemo(() => {
    const colors = ['#58a6ff', '#fd8c73', '#2ea043', '#bc8cff', '#db61a2'];
    const idx = (product?.id?.charCodeAt(4) ?? 0) % colors.length;
    return colors[idx];
  }, [product?.id]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.message || 'Produit introuvable'}
        </Alert>
        <Button component={Link} href={`/${locale}/pim`} startIcon={<ArrowBackIcon />}>
          Retour à la liste
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh', p: 3 }}>
      {isReadOnly && (
        <Paper elevation={0} sx={{ bgcolor: 'rgba(88,166,255,0.15)', border: '1px solid #58a6ff', borderRadius: 2, p: 1.5, mb: 2, textAlign: 'center' }}>
          <Typography variant="body2" fontWeight={700} sx={{ color: 'primary.main' }}>
            Mode consultation — Les modifications sont désactivées
          </Typography>
        </Paper>
      )}
      {/* Header */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2.5, mb: 2 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton component={Link} href={`/${locale}/pim`} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Avatar sx={{ width: 52, height: 52, bgcolor: avatarColor, borderRadius: 2, fontSize: '1.1rem', fontWeight: 700 }}>
              {editedProduct?.nameFr?.slice(0, 2).toUpperCase() || 'PR'}
            </Avatar>
            <Box>
              <TextField
                variant="standard"
                value={editedProduct?.nameFr || ''}
                onChange={(e) => handleFieldChange('nameFr', e.target.value)}
                disabled={isReadOnly}
                sx={{ '& .MuiInputBase-input': { fontSize: '1.2rem', fontWeight: 700, width: 350 } }}
              />
              <TextField
                variant="standard"
                value={editedProduct?.nameAr || ''}
                onChange={(e) => handleFieldChange('nameAr', e.target.value)}
                disabled={isReadOnly}
                InputProps={{ style: { direction: 'rtl' } }}
                sx={{ '& .MuiInputBase-input': { fontSize: '0.85rem', width: 350, mt: 0.5 } }}
              />
              <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                <Chip label={editedProduct?.sku} size="small" sx={{ bgcolor: 'rgba(188,140,255,0.08)', color: '#bc8cff', fontFamily: 'monospace', fontWeight: 700 }} />
                <Chip 
                  label={editedProduct?.status === 'active' ? '● Actif' : editedProduct?.status === 'draft' ? '○ Brouillon' : '● Archivé'} 
                  size="small" 
                  sx={{ 
                    bgcolor: editedProduct?.status === 'active' ? 'rgba(46,160,67,0.08)' : editedProduct?.status === 'draft' ? 'rgba(210,153,34,0.12)' : 'rgba(248,81,73,0.08)',
                    color: editedProduct?.status === 'active' ? '#2ea043' : editedProduct?.status === 'draft' ? '#d29922' : '#f85149'
                  }} 
                />
                {editedProduct?.mdmConfirmed && (
                  <Chip label="MDM Confirmé" size="small" icon={<VerifiedIcon sx={{ fontSize: 12 }} />}
                    sx={{ bgcolor: 'rgba(46,160,67,0.08)', color: 'success.main' }} />
                )}
                <Typography variant="caption" color="text.secondary">
                  Modifié {formatRelative(editedProduct?.updatedAt || '')}
                </Typography>
              </Stack>
            </Box>
          </Stack>
          {!isReadOnly && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={isSaving}
                sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#1e3a5f', borderRadius: 2, px: 3 }}
              >
                {isSaving ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleDuplicate}
                disabled={createProduct.isPending}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
              >
                Dupliquer
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setDeleteOpen(true)}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
              >
                Archiver
              </Button>
            </Stack>
          )}
        </Stack>

        {/* Breadcrumb */}
        <Stack direction="row" alignItems="center" spacing={0.5} mt={2}>
          <Typography component={Link} href={`/${locale}/pim`} variant="caption" sx={{ color: 'primary.main', textDecoration: 'none' }}>
            Produits (PIM)
          </Typography>
          <Typography variant="caption" color="text.secondary">/</Typography>
          <Typography variant="caption" color="text.secondary">{editedProduct?.categoryId || 'Catégorie'}</Typography>
          <Typography variant="caption" color="text.secondary">/</Typography>
          <Typography variant="caption" color="text.secondary">{editedProduct?.nameFr}</Typography>
        </Stack>
      </Paper>

      {/* Tabs + Content */}
       <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="flex-start">
        <Box flex={1} minWidth={0}>
          <Paper elevation={0} sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}`, mb: 3, bgcolor: 'transparent' }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': { 
                  textTransform: 'none', 
                  fontWeight: 600, 
                  fontSize: '0.9rem', 
                  color: 'text.secondary', 
                  '&.Mui-selected': { color: '#1e3a5f' },
                  py: 1.5,
                  px: 2
                },
                '& .MuiTabs-indicator': { bgcolor: '#1e3a5f', height: 3 }
              }}
            >
              {TABS.map((tab, idx) => (
                <Tab key={idx} label={tab} />
              ))}
            </Tabs>
          </Paper>

         {activeTab === 0 && (
            <TabInfos 
              product={editedProduct} 
              onUpdate={handleFieldChange}
              onAttributeChange={handleAttributeChange}
              onAddAttribute={addAttribute}
              onRemoveAttribute={removeAttribute}
            />
          )}
          {activeTab === 1 && <TabPrix product={editedProduct} onUpdate={handleFieldChange} />}
          {activeTab === 2 && <TabVariantes product={editedProduct} onUpdate={handleFieldChange} />}
          {activeTab === 3 && <TabMedias product={editedProduct} onUpdate={handleFieldChange} />}
          {activeTab === 4 && (
            <TabLogistique
              product={editedProduct}
              onUpdate={handleFieldChange}
              onOpenRestrictions={() => setRestrictionsOpen(true)}
            />
          )}
          {activeTab === 5 && <TabSeo product={editedProduct} onUpdate={handleFieldChange} />}
        </Box>
        
        <Sidebar product={editedProduct} />
      </Stack>


      {/* Notifications */}
      <Snackbar 
        open={saveSuccess} 
        autoHideDuration={3000} 
        onClose={() => setSaveSuccess(false)} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSaveSuccess(false)}>
          Produit enregistré avec succès
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(actionToast)}
        autoHideDuration={3000}
        onClose={() => setActionToast('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        message={actionToast}
      />

      <ConfirmDeleteProductModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        productId={id}
        productName={editedProduct?.nameFr}
        onDone={() => {
          setActionToast('Produit archivé.');
          router.push(`/${locale}/pim`);
        }}
      />

      <ManageRestrictionsModal
        open={restrictionsOpen}
        onClose={() => setRestrictionsOpen(false)}
        productId={id}
        initialRestricted={editedProduct?.wilayasRestreintes || []}
        onDone={(restricted) => {
          handleFieldChange('wilayasRestreintes', restricted);
          setActionToast(`${restricted.length} wilaya(s) restreinte(s).`);
        }}
      />

      <Snackbar 
        open={!!saveError} 
        autoHideDuration={5000} 
        onClose={() => setSaveError(null)} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setSaveError(null)}>
          {saveError}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ─── Composant Infos Générales (version finale avec le design demandé) ────────

function TabInfos({ product, onUpdate, onAttributeChange, onAddAttribute, onRemoveAttribute }: { 
  product: Product | null; 
  onUpdate: (field: string, value: any) => void;
  onAttributeChange: (index: number, field: string, value: string) => void;
  onAddAttribute: () => void;
  onRemoveAttribute: (index: number) => void;
}) {
  if (!product) return null;

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 3 }}>
      <Typography variant="overline" sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em' }}>
        INFORMATIONS DE BASE
      </Typography>
      
      <Box mt={2}>
        <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
          Nom du Produit
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'stretch', border: '1px solid', borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden', mb: 1.5 }}>
          <Box sx={{ px: 1.5, py: 1, bgcolor: 'background.paper', borderRight: (t) => `1px solid ${t.palette.divider}`, display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: 'primary.main', fontSize: '0.7rem' }}>FR</Typography>
          </Box>
          <TextField
            variant="standard"
            value={product.nameFr}
            onChange={(e) => onUpdate('nameFr', e.target.value)}
            fullWidth
            InputProps={{ disableUnderline: true }}
            sx={{ px: 1.5, py: 0.5 }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'stretch', border: '1px solid', borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
          <Box sx={{ px: 1.5, py: 1, bgcolor: 'background.paper', borderRight: (t) => `1px solid ${t.palette.divider}`, display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: 'primary.main', fontSize: '0.7rem' }}>AR</Typography>
          </Box>
          <TextField
            variant="standard"
            value={product.nameAr}
            onChange={(e) => onUpdate('nameAr', e.target.value)}
            fullWidth
            InputProps={{ disableUnderline: true, style: { direction: 'rtl' } }}
            sx={{ px: 1.5, py: 0.5 }}
          />
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', mt: 0.5, display: 'block' }}>
          FR + AR Obligatoire · Loi Algérienne sur la double langue commerciale
        </Typography>
      </Box>

      {/* Description */}
      <Box mt={3}>
        <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
          Description
        </Typography>
        
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden', mb: 1.5 }}>
          <Box sx={{ px: 1.5, py: 0.75, bgcolor: 'background.paper', borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: 'primary.main', fontSize: '0.7rem' }}>FR</Typography>
          </Box>
          <TextField
            variant="standard"
            value={product.descriptionFr}
            onChange={(e) => onUpdate('descriptionFr', e.target.value)}
            fullWidth
            multiline
            rows={3}
            InputProps={{ disableUnderline: true }}
            sx={{ px: 1.5, py: 1 }}
          />
        </Box>
        
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
          <Box sx={{ px: 1.5, py: 0.75, bgcolor: 'background.paper', borderBottom: (t) => `1px solid ${t.palette.divider}`, display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: 'primary.main', fontSize: '0.7rem' }}>AR</Typography>
          </Box>
          <TextField
            variant="standard"
            value={product.descriptionAr}
            onChange={(e) => onUpdate('descriptionAr', e.target.value)}
            fullWidth
            multiline
            rows={3}
            InputProps={{ disableUnderline: true, style: { direction: 'rtl' } }}
            sx={{ px: 1.5, py: 1 }}
          />
        </Box>
      </Box>

      {/* SKU et Marque */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
            SKU *
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={product.sku}
            disabled
            sx={{ bgcolor: 'background.paper' }}
            InputProps={{ 
              startAdornment: <LockIcon sx={{ fontSize: 14, color: 'text.secondary', mr: 1 }} />,
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', mt: 0.5, display: 'block' }}>
            Généré par le Registre MDM - Non modifiable
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
            Marque
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={product.brandId || ''}
            onChange={(e) => onUpdate('brandId', e.target.value)}
            placeholder="Nike"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
            Référence Fournisseur
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={product.supplierRef || ''}
            onChange={(e) => onUpdate('supplierRef', e.target.value)}
            placeholder="SSD-042"
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', mt: 0.5, display: 'block' }}>
            Lieu au module Approvisionnement : {product.supplierRef || 'REF: ---'}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
            Modèle
          </Typography>
          <TextField
            fullWidth
            size="small"
            value="Air Max 90"
            placeholder="Modèle"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
            Code-Barres
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={product.variants?.[0]?.barcode || '8901234567893'}
            placeholder="EAN-13"
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', mt: 0.5, display: 'block' }}>
            EAN-13 UCODE Standarde en entrepôt (WMS)
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
            Catégorie Principale *
          </Typography>
          <FormControl fullWidth size="small">
            <Select 
              value={product.categoryId} 
              onChange={(e) => onUpdate('categoryId', e.target.value)}
              sx={{ bgcolor: 'background.paper' }}
            >
              <MenuItem value="Électronique">Électronique</MenuItem>
              <MenuItem value="Mode">Mode</MenuItem>
              <MenuItem value="Maison">Maison</MenuItem>
              <MenuItem value="Beauté">Beauté</MenuItem>
              <MenuItem value="Sport">Sport</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
            Origine
          </Typography>
          <TextField
            fullWidth
            size="small"
            value="Importé (Vietnam)"
            placeholder="Origine"
          />
        </Grid>
      </Grid>

      {/* STATUT PRODUIT */}
      <Box mt={3}>
        <Typography variant="overline" sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em', display: 'block', mb: 1.5 }}>
          STATUT PRODUIT
        </Typography>
        
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Box sx={{ 
            flex: 1, 
            border: `2px solid ${product.status === 'draft' ? '#1e3a5f' : '#30363d'}`,
            borderRadius: 2, 
            p: 1.5, 
            bgcolor: product.status === 'draft' ? '#f0f7ff' : 'transparent',
            cursor: 'pointer'
          }}
          onClick={() => onUpdate('status', 'draft')}>
            <AccessTimeIcon sx={{ fontSize: 20, color: 'warning.main', mb: 0.5 }} />
            <Typography variant="body2" fontWeight={700}>Brouillon</Typography>
            <Typography variant="caption" color="text.secondary">Visible uniquement par les managers</Typography>
            <Typography variant="caption" sx={{ color: 'warning.main', fontSize: '0.68rem', display: 'block', mt: 0.5 }}>
              Activation requise: Inventory Mgr
            </Typography>
          </Box>
          
          <Box sx={{ 
            flex: 1, 
            border: `2px solid ${product.status === 'active' ? '#1e3a5f' : '#30363d'}`,
            borderRadius: 2, 
            p: 1.5, 
            bgcolor: product.status === 'active' ? '#f0f7ff' : 'transparent',
            cursor: 'pointer'
          }}
          onClick={() => onUpdate('status', 'active')}>
            <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main', mb: 0.5 }} />
            <Typography variant="body2" fontWeight={700}>Actif</Typography>
            <Typography variant="caption" color="text.secondary">Publié sur tous les canaux autorisés</Typography>
          </Box>
          
          <Box sx={{ 
            flex: 1, 
            border: `2px solid ${product.status === 'archived' ? '#1e3a5f' : '#30363d'}`,
            borderRadius: 2, 
            p: 1.5, 
            bgcolor: product.status === 'archived' ? '#f0f7ff' : 'transparent',
            cursor: 'pointer'
          }}
          onClick={() => onUpdate('status', 'archived')}>
            <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
              <Box sx={{ width: 10, height: 2, bgcolor: '#fca5a5' }} />
            </Box>
            <Typography variant="body2" fontWeight={700} sx={{ color: 'error.main' }}>Discontinuité</Typography>
            <Typography variant="caption" color="text.secondary">Nouvelles commandes bloquées</Typography>
            <Typography variant="caption" sx={{ color: 'error.main', fontSize: '0.68rem', display: 'block', mt: 0.5 }}>
              Conservation 10 ans (Loi fiscale)
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ mt: 2, bgcolor: 'rgba(88,166,255,0.15)', border: '1px solid #58a6ff', borderRadius: 2, p: 1.5 }}>
          <Stack direction="row" alignItems="flex-start" spacing={1}>
            <ShieldOutlinedIcon sx={{ fontSize: 16, color: 'primary.main', mt: 0.1 }} />
            <Box>
              <Typography variant="caption" fontWeight={700} sx={{ color: 'primary.main' }}>
                Règle de Séparation des Tâches (SoD)
              </Typography>
              <Typography variant="caption" sx={{ color: '#1e40af', display: 'block', fontSize: '0.7rem', mt: 0.3 }}>
                Le Product Manager crée et enrichit les fiches produits (brouillon).<br />
                L activation vers Actif requiert l approbation de l Inventory Manager ou du SuperAdmin.
              </Typography>
              <Typography variant="caption" sx={{ color: 'primary.main', fontSize: '0.65rem', display: 'block', mt: 0.3 }}>
                Source: Architecture FERZA V2.0 — Section RBAC
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* POLITIQUE DE RETOUR */}
      <Box mt={3}>
        <Typography variant="overline" sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em', display: 'block', mb: 1.5 }}>
          POLITIQUE DE RETOUR
        </Typography>
        
        <Box sx={{ bgcolor: 'rgba(210,153,34,0.12)', border: '1px solid #d29922', borderRadius: 2, p: 1.5, mb: 2 }}>
          <Typography variant="caption" sx={{ color: '#92400e', fontSize: '0.72rem' }}>
            Le taux de retour en Algérie est de 20–40% (moyenne marché). Une politique de retour claire réduit les litiges clients.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box 
              sx={{ 
                border: `2px solid ${product.returnPolicy === 'Retours 7 jours' ? '#2ea043' : '#30363d'}`,
                borderRadius: 2, 
                p: 1.5, 
                bgcolor: product.returnPolicy === 'Retours 7 jours' ? 'rgba(46,160,67,0.08)' : 'transparent',
                cursor: 'pointer',
              }}
              onClick={() => onUpdate('returnPolicy', 'Retours 7 jours')}
            >
              <Typography variant="body2" fontWeight={700} sx={{ color: 'success.main' }}>
                ↩ Retours — 7 jours
              </Typography>
              <Typography variant="caption" color="text.secondary">Remboursement ou échange</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box 
              sx={{ 
                border: `2px solid ${product.returnPolicy === 'Non retournable' ? '#f85149' : '#30363d'}`,
                borderRadius: 2, 
                p: 1.5, 
                bgcolor: product.returnPolicy === 'Non retournable' ? 'rgba(248,81,73,0.08)' : 'transparent',
                cursor: 'pointer',
              }}
              onClick={() => onUpdate('returnPolicy', 'Non retournable')}
            >
              <Typography variant="body2" fontWeight={700} sx={{ color: 'error.main' }}>
                ✕ Non Retournable
              </Typography>
              <Typography variant="caption" color="text.secondary">Préciser la raison obligatoirement</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box 
              sx={{ 
                border: `2px solid ${product.returnPolicy === 'Retours partiels' ? '#fd8c73' : '#30363d'}`,
                borderRadius: 2, 
                p: 1.5, 
                bgcolor: product.returnPolicy === 'Retours partiels' ? 'rgba(253,140,115,0.08)' : 'transparent',
                cursor: 'pointer',
              }}
              onClick={() => onUpdate('returnPolicy', 'Retours partiels')}
            >
              <Typography variant="body2" fontWeight={700} sx={{ color: '#fd8c73' }}>
                ↻ Retours Partiels
              </Typography>
              <Typography variant="caption" color="text.secondary">Conditions spécifiques</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* ATTRIBUTS & SPÉCIFICATIONS */}
      <Box mt={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="overline" sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em' }}>
            ATTRIBUTS & SPÉCIFICATIONS
          </Typography>
          <Button startIcon={<AddIcon />} size="small" onClick={onAddAttribute} sx={{ textTransform: 'none', fontSize: '0.78rem' }}>
            + Ajouter un attribut
          </Button>
        </Stack>
        
        {product.attributes && product.attributes.length > 0 ? (
          product.attributes.map((attr, idx) => (
            <Stack key={idx} direction="row" spacing={1} mt={1.5} alignItems="center">
              <TextField 
                size="small" 
                placeholder="Attribut" 
                value={attr.name} 
                onChange={(e) => onAttributeChange(idx, 'name', e.target.value)} 
                sx={{ flex: 1.2 }} 
              />
              <TextField 
                size="small" 
                placeholder="Valeur (FR)" 
                value={attr.valueFr} 
                onChange={(e) => onAttributeChange(idx, 'valueFr', e.target.value)} 
                sx={{ flex: 1 }} 
              />
              <TextField 
                size="small" 
                placeholder="Valeur (AR)" 
                value={attr.valueAr} 
                onChange={(e) => onAttributeChange(idx, 'valueAr', e.target.value)} 
                InputProps={{ style: { direction: 'rtl' } }} 
                sx={{ flex: 1 }} 
              />
              <TextField 
                size="small" 
                placeholder="Unité" 
                value={attr.unit || ''} 
                onChange={(e) => onAttributeChange(idx, 'unit', e.target.value)} 
                sx={{ width: 80 }} 
              />
              <IconButton size="small" onClick={() => onRemoveAttribute(idx)}>
                <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
              </IconButton>
            </Stack>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center', py: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
            Aucun attribut défini. Cliquez sur (+ Ajouter un attribut)pour commencer.
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

// ───  onglet prix et cout ──────────────────────────────────────────────


function TabPrix({ product, onUpdate }: { product: Product | null; onUpdate: (field: string, value: any) => void }) {
  if (!product) return null;

  const tvaKey: 'standard' | 'reduced' | 'exempt' = product.tvaRate || 'standard';
  const priceHT = product.priceHT || 0;
  const priceTTC = product.priceTTC || 0;
  const costFifo = product.costFifo || 0;

  const tvaAmount = priceTTC - priceHT;
  const tvaRate = tvaKey === 'reduced' ? 9 : tvaKey === 'exempt' ? 0 : 19;
  const marge = costFifo ? priceTTC - costFifo : 0;
  const margePct = costFifo && priceTTC ? Math.round((marge / priceTTC) * 100) : 0;
  const costMoyen = costFifo ? Math.round(costFifo * 0.96) : 0;

  const handleTvaChange = (nextTvaKey: 'standard' | 'reduced' | 'exempt') => {
    onUpdate('tvaRate', nextTvaKey);
    if (priceHT > 0) {
      onUpdate('priceTTC', computePriceTTC(priceHT, nextTvaKey));
    }
  };

  const handlePriceHTChange = (nextHT: number) => {
    onUpdate('priceHT', nextHT);
    onUpdate('priceTTC', computePriceTTC(nextHT, tvaKey));
  };

  const history = Array.isArray(product.priceHistory) ? product.priceHistory : [];
  const formatHistoryDate = (iso: string) =>
    iso
      ? new Date(iso).toLocaleDateString('fr-DZ', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '—';
  const formatHistoryLabel = (type: string) => {
    if (type === 'creation') return 'Création produit';
    if (type === 'price_update') return 'Modification prix';
    if (type === 'cost_update') return 'Coût FIFO mis à jour';
    return type;
  };
  const formatHistoryDetail = (entry: {
    fromPriceTTC: number | null;
    toPriceTTC: number | null;
  }) => {
    const from = entry.fromPriceTTC;
    const to = entry.toPriceTTC;
    if (from === null || from === undefined) {
      return `— → ${Number(to ?? 0).toLocaleString('fr-DZ')} DZD`;
    }
    return `${Number(from).toLocaleString('fr-DZ')} DZD → ${Number(to ?? 0).toLocaleString('fr-DZ')} DZD`;
  };
  const historyDotColor = (type: string) => {
    if (type === 'creation') return '#2ea043';
    if (type === 'cost_update') return '#d29922';
    return '#58a6ff';
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      {/* Message FIFO */}
      <Box sx={{ bgcolor: 'rgba(210,153,34,0.12)', borderBottom: '1px solid #d29922', p: 2 }}>
        <Stack direction="row" alignItems="flex-start" spacing={1}>
          <WarningAmberIcon sx={{ fontSize: 18, color: 'warning.main', mt: 0.1 }} />
          <Typography variant="body2" sx={{ color: '#92400e', fontSize: '0.8rem' }}>
            Le prix de vente est verrouillé en tant que snapshot à la confirmation de commande. Toute modification de prix n affecte pas les commandes en cours ou passées. Méthode de valorisation stock: FIFO (obligatoire).
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ p: 4 }}>
        {/* PRIX DE VENTE (TTC) et DÉCOMPOSITION TVA - 2 colonnes */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Colonne gauche - Prix de vente */}
          <Grid item xs={12} md={6}>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 3 }}>
              <Typography variant="overline" sx={{ fontSize: '0.75rem', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 700 }}>
                PRIX DE VENTE (TTC)
              </Typography>
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="h3" fontWeight={700} sx={{ color: '#111827' }}>
                  {priceTTC.toLocaleString('fr-DZ')} <Typography component="span" variant="body1" color="text.secondary">DZD</Typography>
                </Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" gap={1}>
                <Typography variant="body2" color="text.secondary">Taxe TVA:</Typography>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <Select
                    value={tvaKey}
                    onChange={(e) =>
                      handleTvaChange(e.target.value as 'standard' | 'reduced' | 'exempt')
                    }
                    sx={{ borderRadius: 1.5, fontSize: '0.85rem' }}
                  >
                    <MenuItem value="standard">19% — Standard</MenuItem>
                    <MenuItem value="reduced">9% — Réduit</MenuItem>
                    <MenuItem value="exempt">0% — Exonéré</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mt: 1 }}>
                Règles TVA gérées dans MDM · Banque d Algérie conforme
              </Typography>
            </Box>
          </Grid>

          {/* Colonne droite - Décomposition TVA */}
          <Grid item xs={12} md={6}>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="overline" sx={{ fontSize: '0.75rem', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 700 }}>
                  DÉCOMPOSITION TVA
                </Typography>
                <Chip 
                  label="Finance + Inventory uniquement" 
                  size="small" 
                  sx={{ bgcolor: 'rgba(248,81,73,0.08)', color: 'error.main', fontSize: '0.65rem', height: 24, fontWeight: 600 }} 
                />
              </Stack>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" color="text.secondary">Prix HT:</Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={priceHT}
                    onChange={(e) => handlePriceHTChange(Number(e.target.value) || 0)}
                    InputProps={{ endAdornment: <Typography variant="caption" sx={{ ml: 0.5 }}>DZD</Typography> }}
                    sx={{ maxWidth: 170 }}
                  />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" sx={{ color: '#fd8c73' }}>TVA ({tvaRate}%):</Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ color: '#fd8c73' }}>{tvaAmount.toLocaleString('fr-DZ')} DZD</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1.5, borderTop: '1px dashed #30363d' }}>
                  <Typography variant="body1" fontWeight={700}>Prix TTC:</Typography>
                  <Typography variant="body1" fontWeight={700}>{priceTTC.toLocaleString('fr-DZ')} DZD</Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 1 }}>
                  ≈ {(priceTTC / 147).toFixed(2)} EUR (indicatif)
                </Typography>
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* PRIX DE REVIENT (COÛT FIFO) */}
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 3, mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="overline" sx={{ fontSize: '0.75rem', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 700 }}>
              PRIX DE REVIENT (COÛT FIFO)
            </Typography>
            <Chip label="Confidentiel" size="small" sx={{ bgcolor: 'rgba(248,81,73,0.08)', color: 'error.main', fontSize: '0.65rem', height: 24, fontWeight: 600 }} />
            <LockOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          </Stack>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                <Typography variant="body2" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Dernier Prix d Achat (FIFO)
                </Typography>
                <TextField
                  type="number"
                  size="medium"
                  value={costFifo}
                  onChange={(e) => onUpdate('costFifo', parseFloat(e.target.value))}
                  InputProps={{ endAdornment: <Typography variant="body2">DZD</Typography> }}
                  sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 1, display: 'block' }}>
                  Bon de commande #BC-0892 · 15 Jan 2026
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                <Typography variant="body2" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Coût Moyen Pondéré
                </Typography>
                <Typography variant="h5" fontWeight={700}>{costMoyen.toLocaleString('fr-DZ')} DZD</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 1, display: 'block' }}>
                  Calculé automatiquement (FIFO)
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={5} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Marge Brute</Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: 'success.main' }}>
                {marge.toLocaleString('fr-DZ')} DZD ({margePct}%)
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Point de Rentabilité</Typography>
              <Typography variant="h6" fontWeight={600}>{costFifo.toLocaleString('fr-DZ') || 0} DZD minimum</Typography>
            </Box>
          </Stack>

          <Box sx={{ mt: 2, bgcolor: 'rgba(88,166,255,0.15)', borderRadius: 2, p: 2 }}>
            <Typography variant="body2" sx={{ color: 'primary.main', fontSize: '0.75rem' }}>
              ℹ La méthode FIFO est obligatoire pour la valorisation des stocks (Architecture v2.0). Le coût est mis à jour automatiquement à chaque réception de marchandise (Approvisionnement).
            </Typography>
          </Box>
        </Box>

        {/* HISTORIQUE DES PRIX */}
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 3 }}>
          <Typography variant="overline" sx={{ fontSize: '0.75rem', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 700 }}>
            HISTORIQUE DES PRIX
          </Typography>
          
          <Stack spacing={2} sx={{ mt: 2 }}>
            {history.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Aucun changement de prix enregistré.
              </Typography>
            ) : (
              [...history]
                .sort(
                  (a, b) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
                )
                .map((entry, i) => (
                  <Stack key={`${entry.timestamp}-${i}`} direction="row" alignItems="flex-start" spacing={2}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: historyDotColor(entry.type),
                        flexShrink: 0,
                        mt: 0.4,
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ width: 110, flexShrink: 0 }}>
                      {formatHistoryDate(entry.timestamp)}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {formatHistoryLabel(entry.type)}: <strong>{formatHistoryDetail(entry)}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ width: 200 }}>
                      {entry.by}
                    </Typography>
                  </Stack>
                ))
            )}
          </Stack>
          
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block', mt: 2, pt: 1.5, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
            Journal immuable — conforme Loi 18-07 · Rétention: 10 ans
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
//____onglet variante______________________




interface AttributeRow { name: string; value: string }

const variantDefaults = (product: any) => ({
  attrRows: [{ name: '', value: '' }] as AttributeRow[],
  sku: product?.sku ? `${product.sku}-` : '',
  barcode: '',
  priceTTC: product?.priceTTC || 0,
  costFifo: product?.costFifo || 0,
  stock: 0,
  seuil: product?.stockSeuil || 5,
});

function TabVariantes({
  product,
  onUpdate,
}: {
  product: any;
  onUpdate: (field: string, value: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editVar, setEditVar] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const addVariantMutation = useAddVariant();

  const [newVar, setNewVar] = useState(() => variantDefaults(product));

  if (!product) return null;

  const currentSum = (product.variants || []).reduce(
    (total: number, variant: any) => total + Number(variant.stock || 0),
    0,
  );
  const totalStockCap = Number(
    product.totalStock ?? currentSum,
  );

  const handleOpen = () => {
    setFormError(null);
    addVariantMutation.reset();
    setNewVar(variantDefaults(product));
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormError(null);
  };

  const updateAttrRow = (index: number, field: 'name' | 'value', value: string) => {
    setNewVar((current) => {
      const nextRows = [...current.attrRows];
      nextRows[index] = { ...nextRows[index], [field]: value };
      return { ...current, attrRows: nextRows };
    });
  };

  const addAttrRow = () =>
    setNewVar((current) => ({
      ...current,
      attrRows: [...current.attrRows, { name: '', value: '' }],
    }));

  const removeAttrRow = (index: number) =>
    setNewVar((current) => ({
      ...current,
      attrRows: current.attrRows.filter((_, idx) => idx !== index),
    }));

  const handleSave = async () => {
    setFormError(null);

    const filledRows = newVar.attrRows.filter(
      (row) => row.name.trim() && row.value.trim(),
    );
    if (filledRows.length === 0) {
      setFormError('Ajoutez au moins un attribut (ex. Couleur = Rouge).');
      return;
    }

    if (currentSum + Number(newVar.stock || 0) > totalStockCap) {
      setFormError(
        `Stock variantes (${currentSum + Number(newVar.stock || 0)}) dépasse le stock total du produit (${totalStockCap}).`,
      );
      return;
    }

    const attributes = filledRows.reduce<Record<string, string>>((acc, row) => {
      acc[row.name.trim()] = row.value.trim();
      return acc;
    }, {});

    try {
      const response = await addVariantMutation.mutateAsync({
        productId: product.id,
        variant: {
          sku: newVar.sku || undefined,
          barcode: newVar.barcode || null,
          attributes,
          priceTTC: newVar.priceTTC,
          costFifo: newVar.costFifo,
          stock: newVar.stock,
          seuil: newVar.seuil,
        },
      });
      const updated = (response as any)?.data?.variants;
      if (Array.isArray(updated)) {
        onUpdate('variants', updated);
      }
      handleClose();
    } catch (err) {
      setFormError(
        (err as Error)?.message || 'Échec de l’ajout de la variante.',
      );
    }
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      {/* HEADER */}
      <Box sx={{ p: 3, borderBottom: (t) => `1px solid ${t.palette.divider}`, bgcolor: 'background.paper' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography fontWeight={700}>
              Gestion des Variantes ({product.variants?.length || 0})
            </Typography>
            <Chip
              size="small"
              label={`Stock variantes: ${currentSum} / ${totalStockCap}`}
              sx={{
                bgcolor: currentSum > totalStockCap ? 'rgba(248,81,73,0.08)' : 'rgba(88,166,255,0.15)',
                color: currentSum > totalStockCap ? '#f85149' : '#58a6ff',
                border: `1px solid ${currentSum > totalStockCap ? '#f85149' : '#58a6ff'}`,
                fontWeight: 700,
              }}
            />
          </Stack>

          <Button onClick={handleOpen} variant="contained">
            + Ajouter une variante
          </Button>
        </Stack>
      </Box>

      {/* TABLE */}
      <Box sx={{ p: 3, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.paper' }}>
              <TableCell>VARIANTE</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>CODE-BARRES</TableCell>
              <TableCell>PRIX VENTE</TableCell>
              <TableCell>STOCK</TableCell>
              <TableCell>SEUIL</TableCell>
              <TableCell>ACTIONS</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {product.variants?.map((v: any, idx: number) => {
              const isEditing = editIndex === idx;

              const stockColor =
                v.stock === 0
                  ? '#f85149'
                  : v.stock <= (v.seuil || 5)
                  ? '#d29922'
                  : '#2ea043';

              return (
                <TableRow key={idx}>
                  {/* VARIANTE */}
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        size="small"
                        value={editVar.attributes?.Détails || ''}
                        onChange={(e) =>
                          setEditVar({
                            ...editVar,
                            attributes: { Détails: e.target.value }
                          })
                        }
                      />
                    ) : (
                      v.name || Object.values(v.attributes || {}).join(' ')
                    )}
                  </TableCell>

                  {/* SKU */}
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        size="small"
                        value={editVar.sku}
                        onChange={(e) =>
                          setEditVar({ ...editVar, sku: e.target.value })
                        }
                      />
                    ) : (
                      <code style={{ color: '#bc8cff' }}>{v.sku}</code>
                    )}
                  </TableCell>

                  {/* BARCODE */}
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        size="small"
                        value={editVar.barcode || ''}
                        onChange={(e) =>
                          setEditVar({ ...editVar, barcode: e.target.value })
                        }
                      />
                    ) : (
                      v.barcode ?? '—'
                    )}
                  </TableCell>

                  {/* PRIX */}
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        type="number"
                        size="small"
                        value={editVar.priceTTC}
                        onChange={(e) =>
                          setEditVar({
                            ...editVar,
                            priceTTC: Number(e.target.value)
                          })
                        }
                      />
                    ) : (
                      `${v.priceTTC?.toLocaleString()} DZD`
                    )}
                  </TableCell>

                  {/* STOCK */}
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        type="number"
                        size="small"
                        value={editVar.stock}
                        onChange={(e) =>
                          setEditVar({
                            ...editVar,
                            stock: Number(e.target.value)
                          })
                        }
                      />
                    ) : (
                      <span style={{ color: stockColor, fontWeight: 700 }}>
                        {v.stock}
                      </span>
                    )}
                  </TableCell>

                  {/* SEUIL */}
                  <TableCell>
                    {isEditing ? (
                      <TextField
                        type="number"
                        size="small"
                        value={editVar.seuil}
                        onChange={(e) =>
                          setEditVar({
                            ...editVar,
                            seuil: Number(e.target.value)
                          })
                        }
                      />
                    ) : (
                      v.seuil ?? 5
                    )}
                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell>
                    {isEditing ? (
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          color="success"
                          onClick={() => {
                            const updated = [...product.variants];
                            updated[idx] = editVar;
                            onUpdate('variants', updated);
                            setEditIndex(null);
                          }}
                        >
                          ✔️
                        </IconButton>

                        <IconButton onClick={() => setEditIndex(null)}>
                          ❌
                        </IconButton>
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          onClick={() => {
                            setEditIndex(idx);
                            setEditVar({ ...v });
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() => {
                            const filtered = product.variants.filter(
                              (_: any, i: number) => i !== idx
                            );
                            onUpdate('variants', filtered);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>

      {/* MODAL */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 700 }}>Nouvelle variante</DialogTitle>

        <DialogContent dividers>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            Attributs (Nom → Valeur)
          </Typography>
          <Stack spacing={1.5} sx={{ mt: 1, mb: 2 }}>
            {newVar.attrRows.map((row, idx) => (
              <Stack key={idx} direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  label="Nom"
                  placeholder="Couleur"
                  value={row.name}
                  onChange={(e) => updateAttrRow(idx, 'name', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  label="Valeur"
                  placeholder="Rouge"
                  value={row.value}
                  onChange={(e) => updateAttrRow(idx, 'value', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <IconButton
                  size="small"
                  onClick={() => removeAttrRow(idx)}
                  disabled={newVar.attrRows.length === 1}
                  aria-label="Supprimer l'attribut"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={addAttrRow}
              sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
            >
              Ajouter un attribut
            </Button>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="SKU"
                value={newVar.sku}
                onChange={(e) => setNewVar({ ...newVar, sku: e.target.value })}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Code-barres"
                value={newVar.barcode}
                onChange={(e) => setNewVar({ ...newVar, barcode: e.target.value })}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                type="number"
                fullWidth
                size="small"
                label="Prix Vente (TTC)"
                value={newVar.priceTTC}
                onChange={(e) => setNewVar({ ...newVar, priceTTC: Number(e.target.value) })}
              />
            </Grid>

            <Grid item xs={4}>
              <TextField
                type="number"
                fullWidth
                size="small"
                label="Prix Coût"
                value={newVar.costFifo}
                onChange={(e) => setNewVar({ ...newVar, costFifo: Number(e.target.value) })}
              />
            </Grid>

            <Grid item xs={2}>
              <TextField
                type="number"
                fullWidth
                size="small"
                label="Stock"
                value={newVar.stock}
                onChange={(e) => setNewVar({ ...newVar, stock: Number(e.target.value) })}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={2}>
              <TextField
                type="number"
                fullWidth
                size="small"
                label="Seuil"
                value={newVar.seuil}
                onChange={(e) => setNewVar({ ...newVar, seuil: Number(e.target.value) })}
              />
            </Grid>
          </Grid>

          <Typography
            variant="caption"
            sx={{ display: 'block', mt: 2, color: 'text.secondary' }}
          >
            Contrainte : Σ(stock variantes) ≤ stock total du produit
            ({currentSum} + {Number(newVar.stock || 0)} ≤ {totalStockCap}).
          </Typography>

          {formError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {formError}
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={addVariantMutation.isPending}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={addVariantMutation.isPending}
          >
            {addVariantMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}


//______onglet Medias_______________


function TabMedias({ product, onUpdate }: { product: Product | null; onUpdate: (field: string, value: any) => void }) {
  const [mediaList, setMediaList] = useState<string[]>(product?.mediaUrls || []);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editMedia, setEditMedia] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const max = 20;

  // Sync si product change
  useEffect(() => {
    setMediaList(product?.mediaUrls || []);
  }, [product?.mediaUrls]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    const images = files.filter(f => f.type.startsWith('image/'));
    if (images.length === 0) return alert('Veuillez sélectionner des images');

    if (mediaList.length + images.length > max) {
      return alert(`Max ${max} fichiers. Il reste ${max - mediaList.length}`);
    }

    setIsUploading(true);
    const newMedia = [...mediaList];
    for (const file of images) {
      const tempUrl = URL.createObjectURL(file);
      newMedia.push(tempUrl);
    }
    setMediaList(newMedia);
    onUpdate('mediaUrls', newMedia);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (idx: number) => {
    const newMedia = [...mediaList];
    const removed = newMedia.splice(idx, 1);
    setMediaList(newMedia);
    onUpdate('mediaUrls', newMedia);
    if (removed[0]?.startsWith('blob:')) URL.revokeObjectURL(removed[0]);
  };

  const handleSetPrimary = (idx: number) => {
    const newMedia = [...mediaList];
    const [selected] = newMedia.splice(idx, 1);
    newMedia.unshift(selected);
    setMediaList(newMedia);
    onUpdate('mediaUrls', newMedia);
  };

  const handleEdit = (idx: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const newMedia = [...mediaList];
      if (newMedia[idx]?.startsWith('blob:')) URL.revokeObjectURL(newMedia[idx]);
      newMedia[idx] = URL.createObjectURL(file);
      setMediaList(newMedia);
      onUpdate('mediaUrls', newMedia);
    };
    input.click();
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      {/* HEADER */}
      <Box sx={{ p: 3, borderBottom: (t) => `1px solid ${t.palette.divider}`, bgcolor: 'background.paper' }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography fontWeight={700}>Gestion des Médias ({mediaList.length})</Typography>
         
        </Stack>
      </Box>

      {/* INPUT & DROP */}
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={handleFileSelect} />
      <Box
        onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
        sx={{
          p: 4, textAlign: 'center',
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'divider',
          borderRadius: 2, mt: 2, cursor: 'pointer',
          bgcolor: (t) => dragActive ? alpha(t.palette.primary.main, 0.12) : t.palette.action.hover,
          transition: 'all 0.2s',
          '&:hover': { borderColor: 'primary.main' },
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? <CircularProgress /> : <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />}
        <Typography>{isUploading ? 'Upload...' : 'Glisser-déposer ou cliquer pour ajouter des images'}</Typography>
      </Box>

      {/* GRILLE */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {mediaList.map((url, idx) => (
            <Grid item xs={6} sm={4} md={3} key={idx}>
              <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', aspectRatio: '1', border: '1px solid', borderColor: 'divider', '&:hover .overlay': { opacity: 1 } }}>
                <img src={url} alt={`media-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <Box className="overlay" sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', opacity: 0, transition: '0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                  <Tooltip title="Définir principale"><IconButton size="small" onClick={() => handleSetPrimary(idx)} sx={{ bgcolor: 'background.paper' }}><StarIcon sx={{ color: 'warning.main' }} /></IconButton></Tooltip>
                  <Tooltip title="Remplacer"><IconButton size="small" onClick={() => handleEdit(idx)} sx={{ bgcolor: 'background.paper' }}><EditIcon sx={{ color: 'primary.main' }} /></IconButton></Tooltip>
                  <Tooltip title="Supprimer"><IconButton size="small" onClick={() => handleDelete(idx)} sx={{ bgcolor: 'background.paper' }}><DeleteIcon sx={{ color: 'error.main' }} /></IconButton></Tooltip>
                </Box>
                {idx === 0 && <Chip label="Principal" size="small" sx={{ position: 'absolute', top: 8, left: 8, bgcolor: (t) => alpha(t.palette.primary.main, 0.15), color: 'primary.main', border: '1px solid', borderColor: 'primary.main', fontWeight: 700 }} />}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
}



//__________onglet logistique____________


function TabLogistique({ product, onUpdate, onOpenRestrictions }: { product: Product | null; onUpdate: (field: string, value: any) => void; onOpenRestrictions: () => void }) {
  if (!product) return null;

  const dimensions = product.dimensions || { lengthCm: 0, widthCm: 0, heightCm: 0 };
  const volume = dimensions.lengthCm && dimensions.widthCm && dimensions.heightCm 
    ? (dimensions.lengthCm * dimensions.widthCm * dimensions.heightCm).toLocaleString('fr-DZ') 
    : '—';
  
  const totalWeight = (product.weightKg || 0) + (product.emballage?.poidsEmballage || 0);

  // ✅ ALL WILAYAS
  const ALL_WILAYAS = [
    'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida','Bouira',
    'Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda',
    'Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem','M’Sila','Mascara',
    'Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arreridj','Boumerdès','El Tarf','Tindouf','Tissemsilt',
    'El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent','Ghardaïa',
    'Relizane','Timimoun','Bordj Badji Mokhtar','Ouled Djellal','Béni Abbès','In Salah','In Guezzam',
    'Touggourt','Djanet','El Meghaier','El Meniaa'
  ];

  const wilayasRestreintes = product.wilayasRestreintes || [];

  // ✅ calcul dynamique
  const wilayasDisponibles = ALL_WILAYAS.filter(w => !wilayasRestreintes.includes(w));

  const handleDimensionChange = (field: string, value: number) => {
    onUpdate('dimensions', { ...dimensions, [field]: value });
  };

  const handleEmballageChange = (field: string, value: any) => {
    onUpdate('emballage', { ...(product.emballage || {}), [field]: value });
  };

  const handleStockChange = (field: string, value: any) => {
    onUpdate('stockManagement', { ...(product.stockManagement || {}), [field]: value });
  };

  const handleAddRestriction = (wilaya: string) => {
    if (!wilayasRestreintes.includes(wilaya)) {
      onUpdate('wilayasRestreintes', [...wilayasRestreintes, wilaya]);
    }
  };

  const handleRemoveRestriction = (wilaya: string) => {
    onUpdate('wilayasRestreintes', wilayasRestreintes.filter(w => w !== wilaya));
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 4 }}>
        {/* DIMENSIONS PRODUIT */}
        <Typography variant="overline" sx={{ fontSize: '0.75rem', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
          DIMENSIONS PRODUIT
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
              Poids *
            </Typography>
            <TextField
              type="number"
              size="medium"
              value={product.weightKg || 0}
              onChange={(e) => onUpdate('weightKg', parseFloat(e.target.value))}
              InputProps={{ endAdornment: <Typography variant="body2">kg</Typography> }}
              sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', mt: 0.5, display: 'block' }}>
              Utilisé pour calcul frais de livraison
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
              Longueur
            </Typography>
            <TextField
              type="number"
              size="medium"
              value={dimensions.lengthCm || ''}
              onChange={(e) => handleDimensionChange('lengthCm', parseFloat(e.target.value))}
              InputProps={{ endAdornment: <Typography variant="body2">cm</Typography> }}
              sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
              Largeur
            </Typography>
            <TextField
              type="number"
              size="medium"
              value={dimensions.widthCm || ''}
              onChange={(e) => handleDimensionChange('widthCm', parseFloat(e.target.value))}
              InputProps={{ endAdornment: <Typography variant="body2">cm</Typography> }}
              sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
              Hauteur
            </Typography>
            <TextField
              type="number"
              size="medium"
              value={dimensions.heightCm || ''}
              onChange={(e) => handleDimensionChange('heightCm', parseFloat(e.target.value))}
              InputProps={{ endAdornment: <Typography variant="body2">cm</Typography> }}
              sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />
          </Grid>
        </Grid>

        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mb: 3, display: 'block' }}>
          Volume calculé: {volume} cm³
        </Typography>

        {/* EMBALLAGE */}
        <Typography variant="overline" sx={{ fontSize: '0.75rem', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
          EMBALLAGE
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
              Poids emballage
            </Typography>
            <TextField
              type="number"
              size="medium"
              value={product.emballage?.poidsEmballage || 80}
              onChange={(e) => handleEmballageChange('poidsEmballage', parseFloat(e.target.value))}
              InputProps={{ endAdornment: <Typography variant="body2">g</Typography> }}
              sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
              Poids total expédition
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ color: 'success.main' }}>
              {totalWeight.toLocaleString('fr-DZ')} g
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
              Type d emballage
            </Typography>
            <FormControl fullWidth size="medium">
              <Select
                value={product.emballage?.typeEmballage || 'Boîte carton'}
                onChange={(e) => handleEmballageChange('typeEmballage', e.target.value)}
                sx={{ borderRadius: 1.5 }}
              >
                <MenuItem value="Boîte carton">Boîte carton</MenuItem>
                <MenuItem value="Enveloppe bulle">Enveloppe bulle</MenuItem>
                <MenuItem value="Palette">Palette</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={product.emballage?.fragile || false}
                  onChange={(e) => handleEmballageChange('fragile', e.target.checked)}
                  size="medium"
                />
              }
              label={<Typography variant="body2" fontWeight={600}>Fragile</Typography>}
            />
            {product.emballage?.fragile && (
              <Typography variant="caption" sx={{ color: '#fd8c73', display: 'block', mt: 0.5, fontSize: '0.68rem' }}>
                Gestion spéciale en entrepôt
              </Typography>
            )}
          </Grid>
        </Grid>

        {/* DISPONIBILITÉ PAR WILAYA */}
        <Typography variant="overline" sx={{ fontSize: '0.75rem', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
          DISPONIBILITÉ PAR WILAYA
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={700} sx={{ color: '#fd8c73' }}>
              {wilayasRestreintes.length} wilayas restreintes sur 58
            </Typography>
            <Button size="small" variant="outlined" onClick={onOpenRestrictions} sx={{ textTransform: 'none', borderRadius: 1.5 }}>
              Gérer les restrictions
            </Button>
          </Stack>

          <Typography variant="caption" fontWeight={600} sx={{ color: 'success.main', display: 'block', mb: 1 }}>
            Disponible ({wilayasDisponibles.length} wilayas):
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 2 }}>
            {wilayasDisponibles.slice(0,10).map((w: string) => (
              <Chip key={w} label={w} size="small" sx={{ bgcolor: 'rgba(46,160,67,0.08)', color: '#166534', fontSize: '0.68rem', height: 24 }} />
            ))}
            {wilayasDisponibles.length > 10 && (
              <Chip label={`+${wilayasDisponibles.length - 10} autres`} size="small" sx={{ bgcolor: 'rgba(139,148,158,0.15)', color: 'text.secondary', fontSize: '0.68rem', height: 24 }} />
            )}
          </Stack>

          <Typography variant="caption" fontWeight={600} sx={{ color: 'error.main', display: 'block', mb: 1 }}>
            Restreint ({wilayasRestreintes.length} wilayas):
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 2 }}>
            {wilayasRestreintes.map((w: string) => (
              <Chip
                key={w}
                label={`${w} ×`}
                size="small"
                onDelete={() => handleRemoveRestriction(w)}
                sx={{ bgcolor: 'rgba(248,81,73,0.08)', color: 'error.main', fontSize: '0.68rem', height: 24 }}
              />
            ))}
          </Stack>

          <FormControl fullWidth size="small">
            <Select
              displayEmpty
              value=""
              onChange={(e) => handleAddRestriction(e.target.value)}
              sx={{ borderRadius: 1.5 }}
            >
              <MenuItem value="" disabled>Ajouter une wilaya restreinte...</MenuItem>
              {ALL_WILAYAS.filter(w => !wilayasRestreintes.includes(w)).map(w => (
                <MenuItem key={w} value={w}>{w}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
<Typography variant="overline" sx={{ fontSize: '0.75rem', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
          GESTION DU STOCK (INVENTORY MANAGER)
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
              Seuil Alerte Stock *
            </Typography>
            <TextField
              type="number"
              size="medium"
              value={product.stockSeuil || 10}
              onChange={(e) => onUpdate('stockSeuil', parseInt(e.target.value))}
              sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
              Quantité Réappro. Suggérée
            </Typography>
            <TextField
              type="number"
              size="medium"
              value={product.stockManagement?.qteReappro || 50}
              onChange={(e) => handleStockChange('qteReappro', parseInt(e.target.value))}
              sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}>
              Délai Réappro. Estimé
            </Typography>
            <TextField
              type="number"
              size="medium"
              value={product.stockManagement?.delaiReappro || 7}
              onChange={(e) => handleStockChange('delaiReappro', parseInt(e.target.value))}
              InputProps={{ endAdornment: <Typography variant="body2">jours</Typography> }}
              sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />
          </Grid>
        </Grid>

        <FormControlLabel
          control={
            <Switch
              checked={product.stockManagement?.reapproAuto || false}
              onChange={(e) => handleStockChange('reapproAuto', e.target.checked)}
              size="medium"
            />
          }
          label={<Typography variant="body2" fontWeight={600}>Réapprovisionnement automatique</Typography>}
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.68rem', ml: 5.5 }}>
          Le réappro automatique crée un bon de commande brouillon envoyé au Procurement Manager
        </Typography>
      </Box>
    </Paper>
  );
    
}
//______onglet seo_____________
function TabSeo({ product, onUpdate }: { product: Product | null; onUpdate: (field: string, value: any) => void }) {
  if (!product) return null;
  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 3 }}>
      <Typography variant="overline" sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 700 }}>RÉFÉRENCEMENT SEO</Typography>
      <Box mt={2}><Typography variant="caption" fontWeight={600}>Meta Title</Typography><TextField fullWidth size="small" placeholder="Titre pour les moteurs de recherche" sx={{ mt: 0.5 }} /></Box>
      <Box mt={2}><Typography variant="caption" fontWeight={600}>Meta Description</Typography><TextField fullWidth multiline rows={2} size="small" placeholder="Description pour les moteurs de recherche" sx={{ mt: 0.5 }} /></Box>
    </Paper>
  );
}

function Sidebar({ product }: { product: Product | null }) {
  if (!product) return null;
  const returnPct = Math.round((product.returnRate || 0) * 100);
  const totalStock = product.variants?.reduce((s, v) => s + (v.stock || 0), 0) || 0;
  return (
    <Box sx={{ width: 300, flexShrink: 0 }}>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Statut & Publication</Typography>
        <Stack direction="row" alignItems="center" spacing={0.6} mb={0.5}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: product.status === 'active' ? '#2ea043' : '#d29922' }} />
          <Typography variant="body2" fontWeight={700} sx={{ color: product.status === 'active' ? '#2ea043' : '#d29922' }}>
            {product.status === 'active' ? 'Produit Actif' : product.status === 'draft' ? 'Brouillon' : 'Archivé'}
          </Typography>
        </Stack>
        <Stack spacing={1} mt={1.5}>
          <Stack direction="row" alignItems="flex-start" spacing={0.75}>
            <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main', mt: 0.1 }} />
            <Box><Typography variant="caption" fontWeight={600}>Créé par {product.createdBy || 'Product Manager'}</Typography><Typography variant="caption" color="text.secondary" display="block">{formatDate(product.createdAt)}</Typography></Box>
          </Stack>
          <Stack direction="row" alignItems="flex-start" spacing={0.75}>
            <AccessTimeIcon sx={{ fontSize: 14, color: 'warning.main', mt: 0.1 }} />
            <Box><Typography variant="caption" fontWeight={600} sx={{ color: 'warning.main' }}>Taux retour: {returnPct}% {returnPct >= 30 ? '⚠️ Alerte' : returnPct >= 20 ? '⚠️ Surveillance' : '✓ Normal'}</Typography></Box>
          </Stack>
        </Stack>
      </Paper>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Performance</Typography>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between"><Typography variant="caption" color="text.secondary">Stock total:</Typography><Typography variant="caption" fontWeight={700}>{totalStock} unités</Typography></Stack>
          <Stack direction="row" justifyContent="space-between"><Typography variant="caption" color="text.secondary">Prix TTC:</Typography><Typography variant="caption" fontWeight={700}>{product.priceTTC?.toLocaleString('fr-DZ') || 0} DZD</Typography></Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
