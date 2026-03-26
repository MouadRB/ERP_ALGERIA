'use client';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon          from '@mui/icons-material/Close';
import AddIcon            from '@mui/icons-material/Add';
import PersonOutlineIcon  from '@mui/icons-material/PersonOutline';
import PhoneOutlinedIcon  from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SearchIcon         from '@mui/icons-material/Search';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import KeyboardArrowDownIcon  from '@mui/icons-material/KeyboardArrowDown';
import { useState }       from 'react';
import { useCreateOrder } from '@/modules/oms/hooks/useCreateOrder';
import { useProductSearch, type ProductSearchItem } from '@/modules/oms/hooks/useProductSearch';
import { useDebounce } from '@/hooks/shared/useDebounce';

// ─── All 48 Algerian wilayas ──────────────────────────────────────────────────

const WILAYAS_48 = [
  { code: '01', name: 'Adrar'          },
  { code: '02', name: 'Chlef'          },
  { code: '03', name: 'Laghouat'       },
  { code: '04', name: 'Oum El Bouaghi' },
  { code: '05', name: 'Batna'          },
  { code: '06', name: 'Béjaïa'         },
  { code: '07', name: 'Biskra'         },
  { code: '08', name: 'Béchar'         },
  { code: '09', name: 'Blida'          },
  { code: '10', name: 'Bouira'         },
  { code: '11', name: 'Tamanrasset'    },
  { code: '12', name: 'Tébessa'        },
  { code: '13', name: 'Tlemcen'        },
  { code: '14', name: 'Tiaret'         },
  { code: '15', name: 'Tizi Ouzou'     },
  { code: '16', name: 'Alger'          },
  { code: '17', name: 'Djelfa'         },
  { code: '18', name: 'Jijel'          },
  { code: '19', name: 'Sétif'          },
  { code: '20', name: 'Saïda'          },
  { code: '21', name: 'Skikda'         },
  { code: '22', name: 'Sidi Bel Abbès' },
  { code: '23', name: 'Annaba'         },
  { code: '24', name: 'Guelma'         },
  { code: '25', name: 'Constantine'    },
  { code: '26', name: 'Médéa'          },
  { code: '27', name: 'Mostaganem'     },
  { code: '28', name: 'M\'Sila'        },
  { code: '29', name: 'Mascara'        },
  { code: '30', name: 'Ouargla'        },
  { code: '31', name: 'Oran'           },
  { code: '32', name: 'El Bayadh'      },
  { code: '33', name: 'Illizi'         },
  { code: '34', name: 'Bordj Bou Arréridj' },
  { code: '35', name: 'Boumerdès'      },
  { code: '36', name: 'El Tarf'        },
  { code: '37', name: 'Tindouf'        },
  { code: '38', name: 'Tissemsilt'     },
  { code: '39', name: 'El Oued'        },
  { code: '40', name: 'Khenchela'      },
  { code: '41', name: 'Souk Ahras'     },
  { code: '42', name: 'Tipaza'         },
  { code: '43', name: 'Mila'           },
  { code: '44', name: 'Aïn Defla'      },
  { code: '45', name: 'Naâma'          },
  { code: '46', name: 'Aïn Témouchent' },
  { code: '47', name: 'Ghardaïa'       },
  { code: '48', name: 'Relizane'       },
];

const SOURCE_OPTIONS = [
  'Saisie manuelle',
  'Appel téléphonique',
  'Facebook',
  'Instagram',
  'WhatsApp',
] as const;

// ─── Form state type ──────────────────────────────────────────────────────────

interface ClientForm {
  nomComplet:   string;
  telephone:    string;
  telephone2:   string;
  adresse:      string;
  wilayaCode:   string;
  commune:      string;
  source:       string;
  fraisLivraison: string;
  noteInterne:  string;
}

interface SelectedItem {
  sku: string;
  nameFr: string;
  nameAr: string;
  priceTTC: number;
  quantity: number;
}

const EMPTY_FORM: ClientForm = {
  nomComplet:    '',
  telephone:     '',
  telephone2:    '',
  adresse:       '',
  wilayaCode:    '',
  commune:       '',
  source:        'Saisie manuelle',
  fraisLivraison: '400',
  noteInterne:   '',
};

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  open:    boolean;
  onClose: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function NewOrderModal({ open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'client' | 'produits'>('client');
  const [form,      setForm]      = useState<ClientForm>(EMPTY_FORM);
  const [errors,    setErrors]    = useState<Partial<ClientForm>>({});
  const [produitSearch, setProduitSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [serverError, setServerError] = useState('');

  const debouncedSearch = useDebounce(produitSearch, 300);
  const productQuery = useProductSearch(debouncedSearch);
  const createOrder = useCreateOrder();
  const isSubmitting = createOrder.isPending;
  const products = productQuery.data?.data ?? [];

  const setField = <K extends keyof ClientForm>(key: K, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = (): boolean => {
    const e: Partial<ClientForm> = {};
    if (!form.nomComplet.trim())  e.nomComplet  = 'Champ requis.';
    if (!form.telephone.trim())   e.telephone   = 'Champ requis.';
    if (!form.adresse.trim())     e.adresse     = 'Champ requis.';
    if (!form.wilayaCode)         e.wilayaCode  = 'Veuillez sélectionner une wilaya.';
    if (!form.commune.trim())     e.commune     = 'Champ requis.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addItem = (product: ProductSearchItem) => {
    setSelectedItems((prev) => {
      const existing = prev.find((p) => p.sku === product.sku);
      if (existing) {
        return prev.map((p) =>
          p.sku === product.sku
            ? { ...p, quantity: p.quantity + 1 }
            : p,
        );
      }
      return [
        ...prev,
        {
          sku: product.sku,
          nameFr: product.nameFr,
          nameAr: product.nameAr,
          priceTTC: product.priceTTC,
          quantity: 1,
        },
      ];
    });
  };

  const updateQty = (sku: string, qty: number) => {
    if (!Number.isFinite(qty)) return;
    setSelectedItems((prev) =>
      prev
        .map((p) => (p.sku === sku ? { ...p, quantity: Math.max(1, qty) } : p)),
    );
  };

  const removeItem = (sku: string) => {
    setSelectedItems((prev) => prev.filter((p) => p.sku !== sku));
  };

  const resetState = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setActiveTab('client');
    setProduitSearch('');
    setSelectedItems([]);
    setServerError('');
    createOrder.reset();
  };

  const handleCreate = () => {
    if (!validate()) {
      setActiveTab('client');
      return;
    }

    const itemsPayload = selectedItems.length
      ? selectedItems.map((item) => ({ sku: item.sku, quantity: item.quantity }))
      : undefined;

    setServerError('');
    createOrder.mutate(
      {
        nomComplet: form.nomComplet.trim(),
        telephone: form.telephone.trim(),
        adresse: form.adresse.trim(),
        wilayaCode: form.wilayaCode,
        commune: form.commune.trim(),
        source: form.source,
        noteInterne: form.noteInterne || undefined,
        items: itemsPayload,
      },
      {
        onSuccess: () => {
          resetState();
          onClose();
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Une erreur est survenue.';
          setServerError(msg);
        },
      },
    );
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // ─── Shared field sx ──────────────────────────────────────────────────────
  const fieldSx = {
    '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: 13 },
    '& .MuiFormHelperText-root': { fontSize: 11, mx: 0, mt: 0.4 },
    '& .MuiInputLabel-root': { fontSize: 13 },
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2.5 } }}
    >
      {/* ── Title ─────────────────────────────────────────── */}
      <DialogTitle
        sx={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          pb:             1.5,
          pt:             2.5,
          px:             3,
        }}
      >
        <Box display="flex" alignItems="center" gap={0.75}>
          <AddIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography fontWeight={700} fontSize={16}>
            Nouvelle Commande Manuelle
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose} sx={{ color: 'text.disabled' }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      {/* ── Tab toggle ────────────────────────────────────── */}
      <Box px={3} pb={1.5}>
        <Box
          display="flex"
          sx={{
            border:       '1px solid',
            borderColor:  'divider',
            borderRadius: 1.5,
            overflow:     'hidden',
            width:        'fit-content',
          }}
        >
          {(['client', 'produits'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab === 'client'
              ? 'Client'
              : `Produits (${selectedItems.length})`;

            return (
              <Button
                key={tab}
                size="small"
                onClick={() => setActiveTab(tab)}
                startIcon={
                  tab === 'client'
                    ? <PersonOutlineIcon sx={{ fontSize: 15 }} />
                    : <Inventory2OutlinedIcon sx={{ fontSize: 15 }} />
                }
                sx={{
                  px:            2,
                  py:            0.75,
                  borderRadius:  0,
                  textTransform: 'none',
                  fontSize:      13,
                  fontWeight:    isActive ? 700 : 400,
                  color:         isActive ? 'primary.main' : 'text.secondary',
                  backgroundColor: isActive
                    ? 'rgba(13,71,161,0.06)'
                    : 'transparent',
                  borderRight:   tab === 'client' ? '1px solid' : 'none',
                  borderColor:   'divider',
                  '&:hover':     {
                    backgroundColor: isActive
                      ? 'rgba(13,71,161,0.08)'
                      : 'action.hover',
                  },
                }}
              >
                {label}
              </Button>
            );
          })}
        </Box>
      </Box>

      <Divider />

      {/* ── Content ───────────────────────────────────────── */}
      <DialogContent sx={{ px: 3, py: 2.5, minHeight: 380 }}>

        {/* ════ CLIENT TAB ════════════════════════════════════ */}
        {activeTab === 'client' && (
          <Box display="flex" flexDirection="column" gap={2}>

            {/* Row 1: Nom complet + Téléphone principal */}
            <Box display="flex" gap={2}>
              <TextField
                label="Nom complet *"
                size="small"
                fullWidth
                placeholder="Nom du client"
                value={form.nomComplet}
                onChange={(e) => setField('nomComplet', e.target.value)}
                error={Boolean(errors.nomComplet)}
                helperText={errors.nomComplet}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />

              <TextField
                label="Téléphone principal *"
                size="small"
                fullWidth
                placeholder="0XXX XX XX XX"
                value={form.telephone}
                onChange={(e) => setField('telephone', e.target.value)}
                error={Boolean(errors.telephone)}
                helperText={errors.telephone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlinedIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
            </Box>

            {/* Row 2: Téléphone secondaire */}
            <TextField
              label="Téléphone secondaire (optionnel)"
              size="small"
              fullWidth
              placeholder="0XXX XX XX XX"
              value={form.telephone2}
              onChange={(e) => setField('telephone2', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneOutlinedIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />

            {/* Row 3: Adresse de livraison */}
            <TextField
              label="Adresse de livraison *"
              size="small"
              fullWidth
              multiline
              minRows={3}
              placeholder="Adresse complète (rue, bâtiment, étage...)"
              value={form.adresse}
              onChange={(e) => setField('adresse', e.target.value)}
              error={Boolean(errors.adresse)}
              helperText={errors.adresse}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mt: -1.5, alignSelf: 'flex-start', pt: 1 }}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />

            {/* Row 4: Wilaya + Commune */}
            <Box display="flex" gap={2}>
              {/* Wilaya select */}
              <Box flex={1}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize:   12,
                    fontWeight: 500,
                    color:      errors.wilayaCode ? 'error.main' : 'text.primary',
                    display:    'block',
                    mb:         0.5,
                  }}
                >
                  Wilaya *
                </Typography>
                <Select
                  size="small"
                  displayEmpty
                  fullWidth
                  value={form.wilayaCode}
                  onChange={(e) => setField('wilayaCode', e.target.value)}
                  error={Boolean(errors.wilayaCode)}
                  IconComponent={KeyboardArrowDownIcon}
                  renderValue={(v) =>
                    v
                      ? `${WILAYAS_48.find((w) => w.code === v)?.name} (${v})`
                      : <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>Sélectionner...</Typography>
                  }
                  sx={{
                    borderRadius: 1.5,
                    fontSize:     13,
                    '& .MuiSelect-icon': { fontSize: 18 },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight:    300,
                        borderRadius: 1.5,
                        mt:           0.5,
                        boxShadow:    '0 4px 16px rgba(0,0,0,0.10)',
                      },
                    },
                  }}
                >
                  {WILAYAS_48.map((w) => (
                    <MenuItem
                      key={w.code}
                      value={w.code}
                      sx={{ fontSize: 13, py: 0.75 }}
                    >
                      {w.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.wilayaCode && (
                  <Typography sx={{ fontSize: 11, color: 'error.main', mt: 0.4 }}>
                    {errors.wilayaCode}
                  </Typography>
                )}
              </Box>

              <TextField
                label="Commune *"
                size="small"
                fullWidth
                placeholder="Commune"
                value={form.commune}
                onChange={(e) => setField('commune', e.target.value)}
                error={Boolean(errors.commune)}
                helperText={errors.commune}
                sx={fieldSx}
              />
            </Box>

            {/* Row 5: Source + Frais de livraison */}
            <Box display="flex" gap={2}>
              {/* Source select */}
              <Box flex={1}>
                <Typography
                  variant="caption"
                  sx={{ fontSize: 12, fontWeight: 500, display: 'block', mb: 0.5 }}
                >
                  Source
                </Typography>
                <Select
                  size="small"
                  fullWidth
                  value={form.source}
                  onChange={(e) => setField('source', e.target.value)}
                  IconComponent={KeyboardArrowDownIcon}
                  sx={{
                    borderRadius: 1.5,
                    fontSize:     13,
                    '& .MuiSelect-icon': { fontSize: 18 },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: { borderRadius: 1.5, mt: 0.5, boxShadow: '0 4px 16px rgba(0,0,0,0.10)' },
                    },
                  }}
                >
                  {SOURCE_OPTIONS.map((s) => (
                    <MenuItem key={s} value={s} sx={{ fontSize: 13, py: 0.75 }}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <TextField
                label="Frais de livraison"
                size="small"
                fullWidth
                type="number"
                value={form.fraisLivraison}
                onChange={(e) => setField('fraisLivraison', e.target.value)}
                InputProps={{
                  inputProps: { min: 0 },
                }}
                sx={fieldSx}
              />
            </Box>

            {/* Row 6: Note interne */}
            <TextField
              label="Note interne (optionnel)"
              size="small"
              fullWidth
              multiline
              minRows={2}
              placeholder="Notes pour l'équipe..."
              value={form.noteInterne}
              onChange={(e) => setField('noteInterne', e.target.value)}
              sx={fieldSx}
            />
          </Box>
        )}

        {/* ════ PRODUITS TAB ══════════════════════════════════ */}
        {activeTab === 'produits' && (
          <Box>
            {/* Search */}
            <Box mb={2}>
              <Typography
                variant="caption"
                sx={{ fontSize: 12, fontWeight: 500, display: 'block', mb: 0.75 }}
              >
                Rechercher un produit
              </Typography>
              <TextField
                size="small"
                fullWidth
                autoFocus
                placeholder="Nom ou SKU du produit..."
                value={produitSearch}
                onChange={(e) => setProduitSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius:  1.5,
                    fontSize:      13,
                    borderColor:   'primary.main',
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Box>

            {/* Search results */}
            {produitSearch.trim().length > 0 && (
              <Box sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                {productQuery.isLoading ? (
                  <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : products.length === 0 ? (
                  <Box sx={{ py: 2, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                      Aucun produit trouvé.
                    </Typography>
                  </Box>
                ) : (
                  products.map((product) => (
                    <Box
                      key={product.sku}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 1.5,
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-of-type': { borderBottom: 'none' },
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                          {product.nameFr}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                          {product.sku}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => addItem(product)}
                        sx={{ textTransform: 'none', fontSize: 12, borderRadius: 1.5 }}
                      >
                        Ajouter
                      </Button>
                    </Box>
                  ))
                )}
              </Box>
            )}

            {/* Articles sélectionnés */}
            <Typography
              variant="caption"
              sx={{ fontSize: 12, fontWeight: 600, display: 'block', mb: 1 }}
            >
              Articles sélectionnés
            </Typography>

            {/* Empty state */}
            {selectedItems.length === 0 && (
              <Box
                sx={{
                  border:          '1px solid',
                  borderColor:     'divider',
                  borderRadius:    2,
                  backgroundColor: '#F8FAFC',
                  py:              5,
                  display:         'flex',
                  flexDirection:   'column',
                  alignItems:      'center',
                  gap:             1,
                }}
              >
                <Inventory2OutlinedIcon
                  sx={{ fontSize: 36, color: 'text.disabled' }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: 13, fontWeight: 500 }}
                >
                  Aucun article sélectionné
                </Typography>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ fontSize: 12 }}
                >
                  Recherchez et ajoutez des produits ci-dessus
                </Typography>
              </Box>
            )}

            {selectedItems.length > 0 && (
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                {selectedItems.map((item) => (
                  <Box
                    key={item.sku}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1.5,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-of-type': { borderBottom: 'none' },
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                        {item.nameFr}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                        {item.sku}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQty(item.sku, Number(e.target.value))}
                        inputProps={{ min: 1 }}
                        sx={{ width: 70, '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: 12 } }}
                      />
                      <IconButton size="small" onClick={() => removeItem(item.sku)}>
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {selectedItems.length === 0 && (
              <Alert
                severity="info"
                sx={{ mt: 1.5, fontSize: 12, py: 0.5 }}
              >
                La commande peut être créée sans produits et complétée
                ultérieurement.
              </Alert>
            )}
          </Box>
        )}

        {serverError && (
          <Alert severity="error" sx={{ mt: 2, fontSize: 12 }}>
            {serverError}
          </Alert>
        )}
      </DialogContent>

      <Divider />

      {/* ── Actions ───────────────────────────────────────── */}
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleClose}
          disabled={isSubmitting}
          sx={{
            textTransform: 'none',
            fontWeight:    500,
            borderRadius:  1.5,
            fontSize:      13,
          }}
        >
          Annuler
        </Button>

        <Button
          variant="contained"
          size="small"
          onClick={handleCreate}
          disabled={isSubmitting}
          startIcon={
            isSubmitting
              ? <CircularProgress size={14} color="inherit" />
              : <AddIcon sx={{ fontSize: 16 }} />
          }
          sx={{
            textTransform: 'none',
            fontWeight:    700,
            borderRadius:  1.5,
            fontSize:      13,
            boxShadow:     'none',
            '&:hover':     { boxShadow: 'none' },
          }}
        >
          {isSubmitting ? 'Création...' : 'Créer la commande'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
