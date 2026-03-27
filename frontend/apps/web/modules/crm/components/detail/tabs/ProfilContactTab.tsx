'use client';

import * as React from 'react';
import {
  Box, Chip, Divider, FormControl, FormControlLabel,
  FormLabel, MenuItem, Paper, Radio, RadioGroup, TextField,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import type { Customer } from '@ferza/shared';
import { WILAYAS } from '@ferza/shared';
import { useUpdateCustomer } from '@/modules/crm/hooks/useUpdateCustomer';
import { SEGMENT_COLOR, SEGMENT_BG } from '@/modules/crm/utils/segmentColors';

interface Props { customer: Customer; }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} mb={1.5}>{title}</Typography>
      {children}
    </Paper>
  );
}

export default function ProfilContactTab({ customer }: Props) {
  const updateCustomer = useUpdateCustomer();
  const [editingName, setEditingName] = React.useState(false);
  const [nameFr,      setNameFr]      = React.useState(customer.nameFr);

  const handleChannelChange = (channel: string) => {
    updateCustomer.mutate({ id: customer.id, body: { preferredChannel: channel as Customer['preferredChannel'] } });
  };

  const handleLanguageChange = (lang: string) => {
    updateCustomer.mutate({ id: customer.id, body: { preferredLanguage: lang as Customer['preferredLanguage'] } });
  };

  const handleWilayaChange = (code: string) => {
    updateCustomer.mutate({ id: customer.id, body: { wilayaCode: code as Customer['wilayaCode'] } });
  };

  const saveName = () => {
    updateCustomer.mutate({ id: customer.id, body: { nameFr } });
    setEditingName(false);
  };

  const wilaya = WILAYAS.find((w) => w.code === customer.wilayaCode);

  return (
    <Box>
      {/* CONTACT */}
      <Section title="Contact">
        {/* Phone primary */}
        <Box mb={1.5}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Téléphone principal</Typography>
          <Box display="flex" alignItems="center" gap={1} mt={0.3}>
            <Typography variant="body1" fontFamily="monospace" fontWeight={700}>{customer.phone}</Typography>
            <Typography variant="caption" color="text.disabled">
              Identifiant unique CRM · Non modifiable sans approbation
            </Typography>
          </Box>
        </Box>

        {/* Phone secondary */}
        <Box mb={1.5}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Téléphone secondaire</Typography>
          <Box mt={0.3}>
            {customer.phoneSec
              ? <Typography variant="body2" fontFamily="monospace">{customer.phoneSec}</Typography>
              : <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>Non renseigné · + Ajouter</Typography>
            }
          </Box>
        </Box>

        {/* Preferred channel */}
        <FormControl sx={{ mb: 1.5 }}>
          <FormLabel sx={{ fontSize: 12, fontWeight: 600 }}>Canal préféré</FormLabel>
          <RadioGroup
            row
            value={customer.preferredChannel ?? ''}
            onChange={(e) => handleChannelChange(e.target.value)}
          >
            <FormControlLabel value="telephone" control={<Radio size="small" />} label="Téléphone" />
            <FormControlLabel value="whatsapp"  control={<Radio size="small" />} label="WhatsApp"  />
            <FormControlLabel value="both"      control={<Radio size="small" />} label="Les deux"  />
          </RadioGroup>
        </FormControl>

        {/* Preferred language */}
        <TextField
          select size="small" label="Langue préférée"
          value={customer.preferredLanguage ?? ''}
          onChange={(e) => handleLanguageChange(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="darija">Darija</MenuItem>
          <MenuItem value="français">Français</MenuItem>
          <MenuItem value="arabe">Arabe</MenuItem>
        </TextField>
      </Section>

      {/* NOM & WILAYA */}
      <Section title="Identité & Localisation">
        <Box mb={1.5}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Nom complet</Typography>
          {editingName ? (
            <Box display="flex" gap={1} mt={0.3}>
              <TextField size="small" value={nameFr} onChange={(e) => setNameFr(e.target.value)} />
              <Box component="span" sx={{ cursor: 'pointer' }} onClick={saveName}>
                <CheckIcon color="success" />
              </Box>
            </Box>
          ) : (
            <Box display="flex" alignItems="center" gap={1} mt={0.3}>
              <Typography variant="body2" fontWeight={600}>{customer.nameFr}</Typography>
              <Box component="span" sx={{ cursor: 'pointer', color: 'text.secondary' }} onClick={() => setEditingName(true)}>
                <EditIcon fontSize="small" />
              </Box>
            </Box>
          )}
        </Box>

        <Box mb={1.5}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Wilaya principale</Typography>
          <Box display="flex" alignItems="center" gap={1} mt={0.3}>
            <Chip label={wilaya?.name ?? customer.wilayaCode} size="small" />
            <TextField
              select size="small" label="Changer wilaya"
              value=""
              onChange={(e) => handleWilayaChange(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              {WILAYAS.map((w) => (
                <MenuItem key={w.code} value={w.code}>{w.code} — {w.name}</MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>

        {customer.address && (
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Adresse de livraison</Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.3}>
              <Typography variant="body2">{customer.address}</Typography>
              <Chip label="Principale" size="small" color="primary" />
            </Box>
            <Typography variant="caption" color="text.disabled">
              Adresses extraites des commandes passées
            </Typography>
          </Box>
        )}
      </Section>

      {/* SEGMENT */}
      <Section title="Segment Actuel">
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Chip
            label={customer.segment}
            sx={{ bgcolor: SEGMENT_BG[customer.segment] ?? '#F5F5F5', color: SEGMENT_COLOR[customer.segment] ?? '#757575', fontWeight: 700 }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary">
          Segment calculé automatiquement · Mis à jour à chaque commande
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="caption" color="text.disabled">
          Critère: basé sur nombre de commandes, taux annulation, taux retour et score fraude
        </Typography>
      </Section>
    </Box>
  );
}
