import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { CatalogueEntry } from '@/modules/catalogue/catalogue.types';
import {
  formatDZD,
  getCatalogueStatusMeta,
  getChannelMeta,
} from '@/modules/catalogue/catalogue.ui';

export type CategoryNode = {
  children: Array<{ count: number; name: string }>;
  count: number;
  name: string;
};

export type CategorySeoDraft = {
  metaTitleAr: string;
  metaTitleFr: string;
  slug: string;
};

interface CatalogueCategoryTabProps {
  categorySearch: string;
  categorySeoDraft: CategorySeoDraft;
  filteredCategoryTree: CategoryNode[];
  selectedCategory: string;
  selectedCategoryRows: CatalogueEntry[];
  onAddCategory: () => void;
  onCategorySearchChange: (value: string) => void;
  onCategorySeoDraftChange: (patch: Partial<CategorySeoDraft>) => void;
  onDeleteCategory: () => void;
  onEditCategory: () => void;
  onOpenProduct: (id: string) => void;
  onSelectCategory: (name: string) => void;
}

export default function CatalogueCategoryTab({
  categorySearch,
  categorySeoDraft,
  filteredCategoryTree,
  selectedCategory,
  selectedCategoryRows,
  onAddCategory,
  onCategorySearchChange,
  onCategorySeoDraftChange,
  onDeleteCategory,
  onEditCategory,
  onOpenProduct,
  onSelectCategory,
}: CatalogueCategoryTabProps) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={3}>
        <Paper variant="outlined" sx={{ borderRadius: 4, p: 2, borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="h6" fontWeight={800}>
              Arborescence
            </Typography>
            <Button size="small" variant="contained" sx={{ borderRadius: 999 }} onClick={onAddCategory}>
              Ajouter
            </Button>
          </Stack>

          <TextField
            fullWidth
            size="small"
            placeholder="Rechercher une categorie..."
            value={categorySearch}
            onChange={(event) => onCategorySearchChange(event.target.value)}
            sx={{ mb: 1.5 }}
          />

          <Stack spacing={0.75}>
            {filteredCategoryTree.map((node) => (
              <Box key={node.name}>
                <Button
                  fullWidth
                  onClick={() => onSelectCategory(node.name)}
                  sx={{
                    justifyContent: 'space-between',
                    borderRadius: 3,
                    color: 'text.secondary',
                    bgcolor: (t) =>
                      selectedCategory === node.name ? alpha(t.palette.primary.main, 0.15) : 'transparent',
                  }}
                >
                  <span>{node.name}</span>
                  <span>{node.count}</span>
                </Button>
                <Stack spacing={0.4} sx={{ pl: 1.25, pt: 0.5 }}>
                  {node.children.map((child) => (
                    <Button
                      key={child.name}
                      fullWidth
                      onClick={() => onSelectCategory(child.name)}
                      sx={{
                        justifyContent: 'space-between',
                        borderRadius: 3,
                        color: 'text.secondary',
                        bgcolor: selectedCategory === child.name ? 'rgba(88,166,255,0.15)' : 'transparent',
                      }}
                    >
                      <span>{child.name}</span>
                      <span>{child.count}</span>
                    </Button>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} lg={9}>
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {selectedCategoryRows[0]?.categoryPath || selectedCategory}
                </Typography>
                <Typography variant="h5" fontWeight={800}>
                  {selectedCategory || 'Categorie'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedCategoryRows.length} produits - Cree le 10 Jan 2026 - Par SuperAdmin
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={onEditCategory}>
                  Modifier
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineOutlinedIcon />}
                  onClick={onDeleteCategory}
                >
                  Supprimer
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Grid container spacing={1.5}>
            <Grid item xs={12} md={6}>
              <InfoSurface title="TVA" value="19% - Standard" subtitle="Gere dans MDM" />
            </Grid>
            <Grid item xs={12} md={6}>
              <InfoSurface
                title="Canaux"
                value={selectedCategoryRows[0]?.channels.map((channel) => getChannelMeta(channel).label).join(' + ') || 'Aucun'}
                subtitle="Les nouveaux produits heritent de ces canaux"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoSurface
                title="Publies"
                value={String(selectedCategoryRows.filter((row) => row.status === 'published').length)}
                subtitle="Produits actifs"
                tone="#2ea043"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoSurface
                title="Non publies"
                value={String(selectedCategoryRows.filter((row) => row.status === 'draft').length)}
                subtitle="En attente"
                tone="#d29922"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoSurface
                title="Masques"
                value={String(selectedCategoryRows.filter((row) => row.status === 'masked').length)}
                subtitle="Rupture"
                tone="#f85149"
              />
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              SEO Categorie
            </Typography>
            <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meta Titre FR"
                  size="small"
                  value={categorySeoDraft.metaTitleFr}
                  helperText={`${categorySeoDraft.metaTitleFr.length}/60 caracteres`}
                  onChange={(event) =>
                    onCategorySeoDraftChange({
                      metaTitleFr: event.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meta Titre AR"
                  size="small"
                  value={categorySeoDraft.metaTitleAr}
                  onChange={(event) =>
                    onCategorySeoDraftChange({
                      metaTitleAr: event.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Slug URL"
                  size="small"
                  value={categorySeoDraft.slug}
                  onChange={(event) =>
                    onCategorySeoDraftChange({
                      slug: event.target.value,
                    })
                  }
                />
              </Grid>
            </Grid>
            <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
              Le slug est genere automatiquement. Modifier avec precaution (impact SEO).
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, borderColor: 'divider' }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              Produits dans cette categorie
            </Typography>
            <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
              {selectedCategoryRows.slice(0, 5).map((row) => {
                const statusMeta = getCatalogueStatusMeta(row.status);
                const channelMeta = getChannelMeta(row.channels[0] ?? 'website');
                return (
                  <Grid item xs={12} md={4} xl={2.4} key={row.id}>
                    <Paper
                      onClick={() => onOpenProduct(row.id)}
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        cursor: 'pointer',
                        border: '1px solid', borderColor: 'divider',
                      }}
                    >
                      <Box
                        sx={{
                          height: 120,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${channelMeta.bg}, #58a6ff)`,
                          mb: 1.25,
                        }}
                      />
                      <Typography fontWeight={700}>{row.nameFr}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDZD(row.priceTTC)}
                      </Typography>
                      <Chip
                        label={statusMeta.label}
                        size="small"
                        sx={{ mt: 1, bgcolor: statusMeta.bg, color: statusMeta.fg }}
                      />
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Stack>
      </Grid>
    </Grid>
  );
}

function InfoSurface({
  subtitle,
  title,
  tone,
  value,
}: {
  subtitle?: string;
  title: string;
  tone?: string;
  value: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 4,
        p: 2.5,
        borderColor: 'divider',
        bgcolor: tone ? alpha(tone, 0.1) : 'background.paper',
      }}
    >
      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="h5" fontWeight={800} sx={{ color: tone ?? 'text.primary' }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
}
