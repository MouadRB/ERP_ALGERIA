"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import FilterListRounded from "@mui/icons-material/FilterListRounded";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import Toast from "@/components/ui/Toast";
import CancelOrderModal from "@/modules/oms/components/modals/CancelOrderModal";
import { useConfirmOrder } from "@/modules/oms/hooks/useConfirmOrder";
import type { ConfirmationsVM } from "@/modules/dashboard/types";

type Props = {
  data: ConfirmationsVM | null;
};

type ToastState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info";
};

const CHIP_PALETTE_KEYS = new Set(['primary', 'secondary', 'success', 'warning', 'error', 'info', 'default']);

const safePaletteKey = (key: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default' =>
  (CHIP_PALETTE_KEYS.has(key) ? key : 'default') as
    | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'default';

export default function ConfirmationTableCard({ data }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string | undefined) ?? 'fr';
  const isDark = theme.palette.mode === 'dark';

  const confirmOrder = useConfirmOrder();
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [bulkPending, setBulkPending] = useState(false);
  const [toast, setToast] = useState<ToastState>({ open: false, message: "", severity: "info" });

  if (!data) return null;
  const { rows, pending } = data;

  const goToOMS = (query?: string) => {
    router.push(query ? `/${locale}/oms?${query}` : `/${locale}/oms`);
  };

  const handleConfirmOne = (orderId: string, reference: string) => {
    confirmOrder.mutate(orderId, {
      onSuccess: () =>
        setToast({ open: true, message: `Commande ${reference} confirmée.`, severity: "success" }),
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : "Échec de la confirmation.";
        setToast({ open: true, message: msg, severity: "error" });
      },
    });
  };

  const handleConfirmAll = async () => {
    if (rows.length === 0 || bulkPending) return;
    setBulkPending(true);
    const results = await Promise.allSettled(
      rows.map((r) => confirmOrder.mutateAsync(r.orderId))
    );
    setBulkPending(false);
    const ok = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - ok;
    setToast({
      open: true,
      message: failed === 0
        ? `${ok} commande(s) confirmée(s).`
        : `${ok} confirmée(s), ${failed} en échec.`,
      severity: failed === 0 ? "success" : "error",
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        overflow: "hidden"
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" p={2.5}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            File de Confirmation
          </Typography>
          <Chip
            label={`${pending} en attente`}
            size="small"
            sx={{
              bgcolor: isDark ? alpha(theme.palette.warning.main, 0.15) : "rgba(210,153,34,0.15)",
              color: isDark ? theme.palette.warning.light : "#d29922",
              fontWeight: 700
            }}
          />
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="text"
            startIcon={<FilterListRounded />}
            onClick={() => goToOMS("status=AwaitingValidation")}
            sx={{ color: "text.secondary", textTransform: "none" }}
          >
            Filtrer
          </Button>
          <Button
            variant="contained"
            color="primary"
            disableElevation
            onClick={handleConfirmAll}
            disabled={bulkPending || rows.length === 0}
            startIcon={bulkPending ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            {bulkPending ? "Confirmation..." : "Tout confirmer"}
          </Button>
        </Stack>
      </Stack>
      <Divider />
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ py: 2 }}># COMMANDE</TableCell>
              <TableCell>CLIENT</TableCell>
              <TableCell>WILAYA</TableCell>
              <TableCell>MONTANT</TableCell>
              <TableCell>RISQUE</TableCell>
              <TableCell>STATUT</TableCell>
              <TableCell>MINUTERIE</TableCell>
              <TableCell align="right">ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const risqueKey = safePaletteKey(row.risque.tone);
              const statutKey = safePaletteKey(row.statut.tone);
              const minuterieKey = safePaletteKey(row.minuterie.tone);
              const risquePalette = risqueKey !== 'default' ? theme.palette[risqueKey] : null;
              const isRowPending =
                bulkPending ||
                (confirmOrder.isPending && confirmOrder.variables === row.orderId);
              return (
                <TableRow key={row.orderId} hover>
                  <TableCell>
                    <Typography
                      fontWeight={700}
                      color="primary.main"
                      sx={{ cursor: "pointer" }}
                      onClick={() => router.push(`/${locale}/oms/${row.orderId}`)}
                    >
                      {row.reference}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600} color="text.primary">{row.client}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.note}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'text.primary' }}>{row.wilaya}</TableCell>
                  <TableCell>
                    <Typography fontWeight={700} color="text.primary">{row.montant}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.risque.label}
                      size="small"
                      color={risqueKey}
                      variant={isDark ? "outlined" : "filled"}
                      sx={{
                        fontWeight: 600,
                        ...(!isDark && risquePalette && {
                          bgcolor: alpha(risquePalette.main, 0.1),
                          color: risquePalette.dark,
                        }),
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.statut.label}
                      size="small"
                      color={statutKey}
                      variant={isDark ? "outlined" : "filled"}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <AccessTimeRounded
                        sx={{
                          fontSize: 14,
                          color: minuterieKey === 'default' ? 'text.disabled' : `${minuterieKey}.main`
                        }}
                      />
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        sx={{ color: minuterieKey === 'default' ? 'text.secondary' : `${minuterieKey}.main` }}
                      >
                        {row.minuterie.label}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        disableElevation
                        disabled={isRowPending}
                        onClick={() => handleConfirmOne(row.orderId, row.reference)}
                        sx={{ textTransform: "none", borderRadius: 1.5 }}
                      >
                        {isRowPending ? "..." : "Confirmer"}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={isRowPending}
                        onClick={() => setCancelTargetId(row.orderId)}
                        sx={{ textTransform: "none", borderRadius: 1.5 }}
                      >
                        Annuler
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Affichage {rows.length} sur {pending} commandes en attente
        </Typography>
        <Button
          variant="text"
          size="small"
          onClick={() => goToOMS()}
          sx={{ textTransform: "none" }}
        >
          Voir toutes les commandes
        </Button>
      </Box>

      {cancelTargetId && (
        <CancelOrderModal
          open={Boolean(cancelTargetId)}
          orderId={cancelTargetId}
          onClose={() => setCancelTargetId(null)}
        />
      )}

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </Paper>
  );
}
