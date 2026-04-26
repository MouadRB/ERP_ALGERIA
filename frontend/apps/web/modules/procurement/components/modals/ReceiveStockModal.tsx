"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import type { BonCommande } from "@ferza/shared";

type ReceiveStockModalProps = {
  open: boolean;
  bc: BonCommande | null;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (items: Array<{ sku: string; quantityReceived: number }>) => void;
};

export default function ReceiveStockModal({
  open,
  bc,
  submitting = false,
  onClose,
  onConfirm
}: ReceiveStockModalProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!open || !bc) return;
    const nextState = bc.items.reduce<Record<string, number>>((acc, item) => {
      const remaining = Math.max(0, item.quantityOrdered - item.quantityReceived);
      acc[item.sku] = remaining > 0 ? remaining : 0;
      return acc;
    }, {});
    setQuantities(nextState);
  }, [bc, open]);

  const payload = useMemo(
    () =>
      Object.entries(quantities)
        .filter(([, quantityReceived]) => quantityReceived > 0)
        .map(([sku, quantityReceived]) => ({ sku, quantityReceived })),
    [quantities]
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Réception de stock</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Saisissez les quantités réellement réceptionnées pour {bc?.reference ?? "ce BC"}.
          </Typography>

          {bc?.items.map((item) => {
            const remaining = Math.max(0, item.quantityOrdered - item.quantityReceived);
            return (
              <Box
                key={item.sku}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr 1fr" },
                  gap: 2,
                  alignItems: "center",
                  border: "1px solid #E2E8F0",
                  borderRadius: 2,
                  p: 2
                }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {item.nameFr}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.sku}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Commandé: {item.quantityOrdered}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Déjà reçu: {item.quantityReceived}
                </Typography>
                <TextField
                  type="number"
                  size="small"
                  label="À recevoir"
                  value={quantities[item.sku] ?? 0}
                  inputProps={{ min: 0, max: remaining }}
                  onChange={(event) =>
                    setQuantities((prev) => ({
                      ...prev,
                      [item.sku]: Math.max(
                        0,
                        Math.min(remaining, Number(event.target.value) || 0)
                      )
                    }))
                  }
                />
              </Box>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          disabled={!bc || payload.length === 0 || submitting}
          onClick={() => onConfirm(payload)}
        >
          {submitting ? "Réception..." : "Valider la réception"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
