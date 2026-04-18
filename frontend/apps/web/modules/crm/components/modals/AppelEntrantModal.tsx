'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useRouter, useParams } from 'next/navigation';
import type { Customer } from '@ferza/shared';
import { usePhoneLookup } from '@/modules/crm/hooks/usePhoneLookup';
import { SEGMENT_COLOR, SEGMENT_BG } from '@/modules/crm/utils/segmentColors';

interface Props {
  open:    boolean;
  onClose: () => void;
}

export default function AppelEntrantModal({ open, onClose }: Props) {
  const [phone,    setPhone]    = useState('');
  const [customer, setCustomer] = useState<Customer | null | undefined>(undefined);
  const [notFound, setNotFound] = useState(false);
  const router = useRouter();
  const locale = (useParams()?.locale as string | undefined) ?? 'fr';

  const { mutate, isPending } = usePhoneLookup();

  function handleSearch() {
    const cleaned = phone.replace(/\s/g, '');
    if (!cleaned) return;
    setNotFound(false);
    setCustomer(undefined);
    mutate(cleaned, {
      onSuccess: (res) => {
        if (res.data) {
          setCustomer(res.data);
        } else {
          setCustomer(null);
          setNotFound(true);
        }
      },
      onError: () => {
        setCustomer(null);
        setNotFound(true);
      },
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch();
  }

  function handleOpen() {
    if (!customer) return;
    onClose();
    router.push(`/${locale}/crm/${customer.id}`);
  }

  function handleClose() {
    setPhone('');
    setCustomer(undefined);
    setNotFound(false);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <PhoneIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Appel entrant
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={0.5}>
          <TextField
            label="Numéro de téléphone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
            size="small"
            placeholder="0551234567"
            inputProps={{ maxLength: 10 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: isPending ? (
                <InputAdornment position="end">
                  <CircularProgress size={16} />
                </InputAdornment>
              ) : null,
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={isPending || !phone.trim()}
            fullWidth
          >
            Rechercher
          </Button>

          {notFound && (
            <Alert severity="warning">
              Aucun client trouvé pour ce numéro. Vous pouvez créer un nouveau profil.
            </Alert>
          )}

          {customer && (
            <>
              <Divider />
              <Box
                sx={{
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <PersonIcon color="action" fontSize="small" />
                  <Typography variant="subtitle2" fontWeight={700}>
                    {customer.nameFr}
                  </Typography>
                  <Chip
                    label={customer.segment}
                    size="small"
                    sx={{
                      fontSize: 10,
                      height: 20,
                      bgcolor: SEGMENT_BG[customer.segment],
                      color:   SEGMENT_COLOR[customer.segment],
                      fontWeight: 700,
                    }}
                  />
                  {customer.blacklisted && (
                    <Chip label="Blacklist" size="small" color="error" sx={{ fontSize: 10, height: 20 }} />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  {customer.phone}
                  {customer.phoneSec && ` · ${customer.phoneSec}`}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {customer.wilayaCode && `Wilaya ${customer.wilayaCode}`}
                  {customer.commune && ` · ${customer.commune}`}
                </Typography>
                <Box display="flex" gap={2} mt={1}>
                  <Typography variant="caption">
                    <strong>{customer.totalOrders ?? 0}</strong> commandes
                  </Typography>
                  <Typography variant="caption">
                    CA <strong>{((customer.totalSpentTTC ?? 0) / 1000).toFixed(0)}k DA</strong>
                  </Typography>
                  {customer.lastOrderDate && (
                    <Typography variant="caption" color="text.disabled">
                      Dernière cmd: {new Date(customer.lastOrderDate).toLocaleDateString('fr-DZ', {
                        day: '2-digit', month: 'short'
                      })}
                    </Typography>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Fermer</Button>
        {customer && (
          <Button
            variant="contained"
            onClick={handleOpen}
            endIcon={<OpenInNewIcon />}
          >
            Ouvrir la fiche
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
