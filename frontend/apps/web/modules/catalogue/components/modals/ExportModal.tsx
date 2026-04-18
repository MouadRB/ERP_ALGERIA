'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';

type ExportModalProps = {
  maskedCount: number;
  onClose: () => void;
  onConfirm: (options: {
    format: string;
    languages: string[];
    scope: string;
  }) => void;
  open: boolean;
  publishedCount: number;
  selectedCount: number;
  totalCount: number;
};

const FORMATS = [
  {
    description: 'Import/Export universel',
    icon: DescriptionOutlinedIcon,
    label: 'CSV',
    value: 'csv',
  },
  {
    description: 'Microsoft Excel',
    icon: GridOnOutlinedIcon,
    label: 'Excel',
    value: 'excel',
  },
  {
    description: 'Document formate',
    icon: PictureAsPdfOutlinedIcon,
    label: 'PDF',
    value: 'pdf',
  },
];

export default function ExportModal({
  maskedCount,
  onClose,
  onConfirm,
  open,
  publishedCount,
  selectedCount,
  totalCount,
}: ExportModalProps) {
  const [format, setFormat] = useState('csv');
  const [scope, setScope] = useState(selectedCount > 0 ? 'selection' : 'all');
  const [languages, setLanguages] = useState<string[]>(['fr', 'ar']);

  useEffect(() => {
    if (!open) return;
    setFormat('csv');
    setScope(selectedCount > 0 ? 'selection' : 'all');
    setLanguages(['fr', 'ar']);
  }, [open, selectedCount]);

  const toggleLanguage = (value: string) =>
    setLanguages((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: (t) => `1px solid ${t.palette.divider}`, fontWeight: 800 }}>
        Exporter le Catalogue
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <BoxSection title="Format">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              {FORMATS.map((item) => {
                const Icon = item.icon;
                const selected = format === item.value;

                return (
                  <Box
                    key={item.value}
                    onClick={() => setFormat(item.value)}
                    sx={{
                      flex: 1,
                      border: '1px solid',
                      borderColor: selected ? '#58a6ff' : '#30363d',
                      bgcolor: selected ? 'rgba(88,166,255,0.15)' : '#fff',
                      borderRadius: 3,
                      p: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Icon sx={{ color: selected ? '#58a6ff' : '#8b949e', mb: 1 }} />
                    <Typography fontWeight={800}>{item.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </BoxSection>

          <BoxSection title="Contenu">
            <RadioGroup value={scope} onChange={(event) => setScope(event.target.value)}>
              <FormControlLabel value="all" control={<Radio />} label={`Tous les produits (${totalCount})`} />
              <FormControlLabel
                value="published"
                control={<Radio />}
                label={`Produits publies (${publishedCount})`}
              />
              <FormControlLabel
                value="masked"
                control={<Radio />}
                label={`Produits masques (${maskedCount})`}
              />
              <FormControlLabel
                value="selection"
                control={<Radio />}
                label={`Selection actuelle (${selectedCount})`}
                disabled={selectedCount === 0}
              />
            </RadioGroup>
          </BoxSection>

          <BoxSection title="Langue">
            <Stack direction="row" spacing={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={languages.includes('fr')}
                    onChange={() => toggleLanguage('fr')}
                  />
                }
                label="Francais"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={languages.includes('ar')}
                    onChange={() => toggleLanguage('ar')}
                  />
                }
                label="Arabe"
              />
            </Stack>
          </BoxSection>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          startIcon={<FileDownloadOutlinedIcon />}
          disabled={languages.length === 0}
          onClick={() => onConfirm({ format, languages, scope })}
          sx={{ borderRadius: 999 }}
        >
          Exporter
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function BoxSection({ title, children }: { children: React.ReactNode; title: string }) {
  return (
    <Stack spacing={1.25}>
      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
        {title}
      </Typography>
      {children}
    </Stack>
  );
}
