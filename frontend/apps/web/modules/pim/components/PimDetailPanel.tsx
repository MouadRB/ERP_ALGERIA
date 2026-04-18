'use client';
// apps/web/modules/pim/components/PimDetailPanel.tsx
import { useState } from 'react';
import {
  Box, Tabs, Tab, Paper, Grid, TextField, Typography, Stack,
  Select, MenuItem, FormControl, Alert, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Divider,
} from '@mui/material';
import CloudUploadIcon   from '@mui/icons-material/CloudUpload';
import EditOutlinedIcon  from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import type { Product } from './pim.types';
import { getTvaLabel, getTvaPercent, getTvaAmount, formatDZD, formatDate } from './pim.helpers';

interface Props { product: Product }

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2.5, mb: 2 }}>
      {title && (
        <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.68rem', display: 'block', mb: 2 }}>
          {title}
        </Typography>
      )}
      {children}
    </Paper>
  );
}

function LangTag({ lang }: { lang: 'FR' | 'AR' }) {
  return (
    <Box sx={{ bgcolor: lang === 'FR' ? 'rgba(88,166,255,0.15)' : 'rgba(46,160,67,0.08)', px: 0.75, py: 0.2, mr: 1, borderRadius: '4px', flexShrink: 0 }}>
      <Typography variant="caption" fontWeight={700} sx={{ color: lang === 'FR' ? '#58a6ff' : '#2ea043', fontSize: '0.68rem' }}>{lang}</Typography>
    </Box>
  );
}

function TabInfos({ product }: Props) {
  return (
    <Box>
      <Section title="Nom du Produit">
        <Stack spacing={1.5} mb={2}>
          <TextField size="small" fullWidth defaultValue={product.nameFr}
            InputProps={{ startAdornment: <LangTag lang="FR" /> }} />
          <TextField size="small" fullWidth defaultValue={product.nameAr}
            inputProps={{ dir: 'rtl' }}
            InputProps={{ startAdornment: <LangTag lang="AR" /> }} />
        </Stack>
        <Stack spacing={1.5}>
          <TextField size="small" fullWidth multiline rows={2} defaultValue={product.descriptionFr}
            placeholder="Description FR..."
            InputProps={{ startAdornment: <Box sx={{ alignSelf: 'flex-start', mt: 0.5 }}><LangTag lang="FR" /></Box> }} />
          <TextField size="small" fullWidth multiline rows={2} defaultValue={product.descriptionAr}
            placeholder="وصف عربي..."
            inputProps={{ dir: 'rtl' }}
            InputProps={{ startAdornment: <Box sx={{ alignSelf: 'flex-start', mt: 0.5 }}><LangTag lang="AR" /></Box> }} />
        </Stack>
      </Section>

      <Section title="Identifiants & Classification">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" fontWeight={600} mb={0.75}>SKU</Typography>
            <TextField size="small" fullWidth defaultValue={product.sku} disabled
              sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: '0.82rem' } }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" fontWeight={600} mb={0.75}>Catégorie</Typography>
            <TextField size="small" fullWidth defaultValue={product.categoryId} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" fontWeight={600} mb={0.75}>Fournisseur</Typography>
            <TextField size="small" fullWidth defaultValue={product.supplierName ?? product.brandId} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" fontWeight={600} mb={0.75}>Référence Fournisseur</Typography>
            <TextField size="small" fullWidth defaultValue={product.supplierRef ?? ''} />
          </Grid>
        </Grid>
      </Section>

      <Section title="Statut Produit">
        <Grid container spacing={1.5}>
          {([
            { key: 'draft',  label: 'Brouillon',   desc: 'Visible managers', color: 'warning.main', bg: 'rgba(210,153,34,0.12)', border: '#d29922' },
            { key: 'active', label: 'Actif',         desc: 'Publié tous canaux', color: 'success.main', bg: 'rgba(46,160,67,0.08)', border: '#2ea043' },
            { key: 'discontinued', label: 'Discontinué', desc: 'Nouvelles commandes bloquées', color: 'error.main', bg: 'rgba(248,81,73,0.08)', border: '#fca5a5' },
          ] as const).map((s) => (
            <Grid item xs={12} sm={4} key={s.key}>
              <Box sx={{ border: `1.5px solid ${product.status === s.key ? s.border : '#30363d'}`, borderRadius: 2, p: 1.5, bgcolor: product.status === s.key ? s.bg : '#161b22', cursor: 'pointer', transition: 'all 0.15s' }}>
                <Typography variant="body2" fontWeight={700} sx={{ color: s.color }}>{s.label}</Typography>
                <Typography variant="caption" color="text.secondary">{s.desc}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Alert severity="info" sx={{ mt: 2, fontSize: '0.72rem' }}>
          🛡 <strong>SoD :</strong> Product Manager crée · Inventory Manager active
        </Alert>
      </Section>
    </Box>
  );
}

function TabPrix({ product }: Props) {
  const tvaAmount  = getTvaAmount(product.priceTTC, product.priceHT);
  const tvaPercent = getTvaPercent(product.tvaRate);
  return (
    <Box>
      <Alert severity="warning" sx={{ mb: 2, fontSize: '0.78rem' }}>
        Prix verrouillé en snapshot à la confirmation · FIFO obligatoire (Loi algérienne)
      </Alert>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Section title="Prix TTC">
            <TextField size="medium" fullWidth defaultValue={product.priceTTC}
              InputProps={{ endAdornment: <Typography variant="body2" color="text.secondary" ml={1}>DZD</Typography> }}
              inputProps={{ style: { fontSize: '1.4rem', fontWeight: 700 } }}
            />
            <Stack direction="row" alignItems="center" spacing={1} mt={1.5}>
              <Typography variant="body2" color="text.secondary">TVA :</Typography>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select defaultValue={product.tvaRate}>
                  <MenuItem value="standard">19% — Standard</MenuItem>
                  <MenuItem value="reduced">9% — Réduit</MenuItem>
                  <MenuItem value="exempt">0% — Exonéré</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Section>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Section title="Décomposition">
            {[
              { label: 'Prix HT :', value: `${product.priceHT.toLocaleString('fr-DZ')} DZD` },
              { label: `TVA (${tvaPercent}%) :`, value: `${tvaAmount.toLocaleString('fr-DZ')} DZD`, color: '#fd8c73' },
            ].map((r) => (
              <Stack key={r.label} direction="row" justifyContent="space-between" mb={0.75}>
                <Typography variant="body2" color="text.secondary">{r.label}</Typography>
                <Typography variant="body2" fontWeight={500} sx={{ color: r.color }}>{r.value}</Typography>
              </Stack>
            ))}
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" fontWeight={700}>Prix TTC :</Typography>
              <Typography variant="body2" fontWeight={700}>{formatDZD(product.priceTTC)}</Typography>
            </Stack>
          </Section>
        </Grid>
      </Grid>
      {product.variants.length > 0 && (
        <Section title="Prix par Variante">
          <TableContainer>
            <Table size="small">
              <TableHead><TableRow sx={{ bgcolor: 'background.paper' }}>
                {['Variante', 'SKU', 'Attributs', 'Prix TTC', 'Stock'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.68rem', color: 'text.secondary' }}>{h}</TableCell>
                ))}
              </TableRow></TableHead>
              <TableBody>
                {product.variants.map((v) => (
                  <TableRow key={v.variantId} sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell><Typography variant="body2" fontWeight={600}>{v.variantId}</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontFamily="monospace" sx={{ color: 'primary.main' }}>{v.sku}</Typography></TableCell>
                    <TableCell><Stack direction="row" gap={0.5}>{Object.entries(v.attributes).map(([k, val]) => <Chip key={k} label={`${k}: ${val}`} size="small" sx={{ fontSize: '0.65rem', height: 20 }} />)}</Stack></TableCell>
                    <TableCell><Typography variant="body2" fontWeight={600}>{formatDZD(v.priceTTC)}</Typography></TableCell>
                    <TableCell><Typography variant="body2" fontWeight={700} sx={{ color: v.stock === 0 ? '#f85149' : 'text.primary' }}>{v.stock}{v.stock === 0 && <Box component="span" sx={{ ml: 0.5, px: 0.5, bgcolor: 'rgba(248,81,73,0.08)', color: 'error.main', borderRadius: '3px', fontSize: '0.6rem' }}>RUPTURE</Box>}</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Section>
      )}
    </Box>
  );
}

function TabVariantes({ product }: Props) {
  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Typography variant="h6" fontWeight={700}>Variantes</Typography>
        <Chip label={product.variants.length} size="small" sx={{ bgcolor: 'rgba(88,166,255,0.15)', color: 'primary.main', fontWeight: 600 }} />
      </Stack>
      {product.variants.length === 0 ? <Alert severity="info">Aucune variante.</Alert> : (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead><TableRow sx={{ bgcolor: 'background.paper' }}>
                {['ID', 'SKU', 'Attributs', 'Prix TTC', 'Stock'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.68rem', color: 'text.secondary' }}>{h}</TableCell>
                ))}
              </TableRow></TableHead>
              <TableBody>
                {product.variants.map((v) => (
                  <TableRow key={v.variantId} sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell><Typography variant="body2" fontWeight={600}>{v.variantId}</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontFamily="monospace" fontWeight={600} sx={{ color: 'primary.main', bgcolor: 'rgba(88,166,255,0.15)', px: 0.75, py: 0.2, borderRadius: '4px' }}>{v.sku}</Typography></TableCell>
                    <TableCell><Stack direction="row" gap={0.5} flexWrap="wrap">{Object.entries(v.attributes).map(([k, val]) => <Chip key={k} label={`${k}: ${val}`} size="small" sx={{ fontSize: '0.65rem', height: 20, bgcolor: 'rgba(139,148,158,0.15)' }} />)}</Stack></TableCell>
                    <TableCell><Typography variant="body2" fontWeight={600}>{formatDZD(v.priceTTC)}</Typography></TableCell>
                    <TableCell><Typography variant="body2" fontWeight={700} sx={{ color: v.stock === 0 ? '#f85149' : v.stock < 5 ? '#d29922' : 'text.primary' }}>{v.stock}</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}

function TabMedias({ product }: Props) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="subtitle1" fontWeight={700}>Médias</Typography>
        <Typography variant="caption" color="text.secondary">{product.mediaUrls.length} / 20</Typography>
      </Stack>
      <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 4, textAlign: 'center', bgcolor: 'background.paper', cursor: 'pointer', '&:hover': { borderColor: '#58a6ff', bgcolor: 'rgba(88,166,255,0.15)' }, transition: 'all 0.2s', mb: 2 }}>
        <CloudUploadIcon sx={{ fontSize: 36, color: 'primary.main', mb: 1 }} />
        <Typography variant="subtitle2" fontWeight={600}>Glisser-déposer vos images</Typography>
        <Button variant="outlined" size="small" sx={{ mt: 1, textTransform: 'none', borderRadius: '8px' }}>Parcourir</Button>
        <Typography variant="caption" color="text.secondary" display="block" mt={1}>JPG, PNG, WEBP · Max 5 MB</Typography>
      </Box>
      {product.mediaUrls.length > 0 && (
        <Grid container spacing={2}>
          {product.mediaUrls.map((url, i) => (
            <Grid item xs={6} sm={3} key={i}>
              <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', aspectRatio: '1', bgcolor: 'rgba(139,148,158,0.15)', '&:hover .ov': { opacity: 1 } }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`media-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <Box className="ov" sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', opacity: 0, transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <IconButton size="small" sx={{ bgcolor: 'background.paper' }}><EditOutlinedIcon sx={{ fontSize: 14 }} /></IconButton>
                  <IconButton size="small" sx={{ bgcolor: 'background.paper' }}><DeleteOutlineIcon sx={{ fontSize: 14, color: 'error.main' }} /></IconButton>
                </Box>
                {i === 0 && <Chip label="Principal" size="small" sx={{ position: 'absolute', top: 6, left: 6, bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: '0.62rem', height: 18 }} />}
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

function TabLogistique({ product }: Props) {
  return (
    <Box>
      <Section title="Poids & Dimensions">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}><Typography variant="body2" fontWeight={600} mb={0.75}>Poids (kg)</Typography><TextField size="small" fullWidth type="number" defaultValue={product.weightKg} /></Grid>
          {(['lengthCm', 'widthCm', 'heightCm'] as const).map((k, i) => (
            <Grid item xs={12} sm={3} key={k}><Typography variant="body2" fontWeight={600} mb={0.75}>{['L (cm)', 'l (cm)', 'H (cm)'][i]}</Typography><TextField size="small" fullWidth type="number" defaultValue={product.dimensions?.[k] ?? ''} placeholder="—" /></Grid>
          ))}
        </Grid>
      </Section>
      <Section title="Traçabilité">
        {[
          { label: 'ID :', value: product.id },
          { label: 'Créé par :', value: product.createdBy },
          { label: 'Créé le :', value: formatDate(product.createdAt) },
          { label: 'Modifié le :', value: formatDate(product.updatedAt) },
        ].map((r) => (
          <Stack key={r.label} direction="row" justifyContent="space-between" sx={{ py: 0.5, borderBottom: '1px solid #f3f4f6' }}>
            <Typography variant="caption" color="text.secondary">{r.label}</Typography>
            <Typography variant="caption" fontWeight={600}>{r.value}</Typography>
          </Stack>
        ))}
      </Section>
    </Box>
  );
}

export default function PimDetailPanel({ product }: Props) {
  const [tab, setTab] = useState(0);
  const TABS = ['Infos Générales', 'Prix & Coûts', `Variantes (${product.variants.length})`, 'Médias', 'Logistique'];
  return (
    <Box>
      <Box sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}`, mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontSize: '0.85rem', fontWeight: 500 }, '& .Mui-selected': { fontWeight: 700 } }}>
          {TABS.map((label, i) => <Tab key={i} label={label} sx={{ minWidth: 'auto', px: 2 }} />)}
        </Tabs>
      </Box>
      {tab === 0 && <TabInfos product={product} />}
      {tab === 1 && <TabPrix product={product} />}
      {tab === 2 && <TabVariantes product={product} />}
      {tab === 3 && <TabMedias product={product} />}
      {tab === 4 && <TabLogistique product={product} />}
    </Box>
  );
}
