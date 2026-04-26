import Link from "next/link";
import { useMemo, useState, type MouseEvent } from "react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography
} from "@mui/material";
import {
  DownloadOutlined,
  HistoryOutlined,
  MoreVert,
  ReceiptLongOutlined,
  ThumbDownOutlined,
  VisibilityOutlined
} from "@mui/icons-material";
import StatusChip from "@/components/ui/StatusChip";
import { formatDZD, getWilayaByCode, type BonCommande } from "@ferza/shared";
import {
  formatProcurementDate,
  getProcurementPriority,
  openProcurementPrintPreview
} from "@/modules/procurement/utils";

type BCTableProps = {
  rows: BonCommande[];
  locale: string;
  loading?: boolean;
  onApprove?: (row: BonCommande) => void;
  onReject?: (row: BonCommande) => void;
  onReceive?: (row: BonCommande) => void;
  onHistory?: (row: BonCommande) => void;
};

const statusMeta = (status: BonCommande["status"]) => {
  switch (status) {
    case "Draft":
      return { label: "Brouillon", color: "default" as const, helper: "En attente" };
    case "PendingApproval":
      return {
        label: "En attente approbation",
        color: "warning" as const,
        helper: "Soumis il y a quelques minutes"
      };
    case "Approved":
      return { label: "Approuvé", color: "success" as const, helper: "Approuvé: Finance" };
    case "SentToSupplier":
      return { label: "Envoyé fournisseur", color: "primary" as const, helper: "Confirmé" };
    case "PartiallyReceived":
      return { label: "Partiellement reçu", color: "warning" as const, helper: "Réception partielle" };
    case "FullyReceived":
      return { label: "Réceptionné", color: "success" as const, helper: "Reçu" };
    case "Invoiced":
      return { label: "Facturé", color: "success" as const, helper: "Facturation OK" };
    case "Rejected":
      return { label: "Refusé", color: "error" as const, helper: "Rejeté" };
    case "Cancelled":
      return { label: "Annulé", color: "error" as const, helper: "Annulé" };
    default:
      return { label: status, color: "default" as const, helper: "" };
  }
};

const initials = (label: string) =>
  label
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export default function BCTable({
  rows,
  locale,
  loading,
  onApprove,
  onReject,
  onReceive,
  onHistory
}: BCTableProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeRow, setActiveRow] = useState<BonCommande | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const gridTemplate = useMemo(
    () =>
      "40px 160px 210px 140px 150px 160px 120px 150px 120px 140px",
    []
  );

  const openMenu = (event: MouseEvent<HTMLElement>, row: BonCommande) => {
    setMenuAnchor(event.currentTarget);
    setActiveRow(row);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setActiveRow(null);
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <Box sx={{ width: "100%", opacity: loading ? 0.6 : 1 }}>
      <Box
        sx={{
          border: "1px solid #E2E8F0",
          borderRadius: 2,
          backgroundColor: "#fff",
          overflow: "hidden"
        }}
      >
        <Box sx={{ overflowX: "auto" }}>
          <Box minWidth={1100}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: gridTemplate,
                gap: 1,
                alignItems: "center",
                padding: "12px 16px",
                borderBottom: "1px solid #E2E8F0",
                color: "text.secondary",
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase"
              }}
            >
              <Box />
              <Box>#BC</Box>
              <Box>Fournisseur</Box>
              <Box>Articles</Box>
              <Box>Montant total</Box>
              <Box>Statut</Box>
              <Box>Priorité</Box>
              <Box>SoD</Box>
              <Box>ETA</Box>
              <Box>Actions</Box>
            </Box>

            {rows.map((row) => {
              const status = statusMeta(row.status);
              const priority = getProcurementPriority(row);
              const firstItem = row.items?.[0];
              const wilaya = getWilayaByCode(row.wilayaCode)?.name ?? row.wilayaCode;

              return (
                <Box
                  key={row.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: gridTemplate,
                    gap: 1,
                    alignItems: "center",
                    padding: "14px 16px",
                    borderBottom: "1px solid #EDF2F7",
                    borderLeft: `4px solid ${priority.accent}`,
                    backgroundColor: row.status === "PendingApproval" ? "#FFF7F0" : "#fff"
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => toggleSelected(row.id)}
                  />
                  <Stack spacing={0.6}>
                    <Typography variant="subtitle2" color="primary">
                      {row.reference}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Créé: {formatProcurementDate(row.createdAt)}
                    </Typography>
                    <Chip
                      label="Auto-généré"
                      size="small"
                      sx={{ width: "fit-content", fontSize: 10, bgcolor: "#F3E8FF" }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, bgcolor: "#E2E8F0" }}>
                      {initials(row.supplierName)}
                    </Avatar>
                    <Stack spacing={0.2}>
                      <Typography variant="body2" fontWeight={600}>
                        {row.supplierName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Wilaya: {wilaya}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack spacing={0.4}>
                    <Typography variant="body2" fontWeight={600}>
                      {row.items?.length ?? 0} article(s)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {firstItem ? firstItem.nameFr : "Aucun article"}
                    </Typography>
                    <Typography variant="caption" color="primary">
                      x{firstItem?.quantityOrdered ?? 0} unités
                    </Typography>
                  </Stack>

                  <Typography variant="body2" fontWeight={700}>
                    {formatDZD(row.totalTTC)}
                  </Typography>

                  <Stack spacing={0.4}>
                    <StatusChip label={status.label} color={status.color} />
                    <Typography variant="caption" color="text.secondary">
                      {status.helper}
                    </Typography>
                  </Stack>

                  <Chip
                    label={priority.label}
                    size="small"
                    sx={{
                      backgroundColor: priority.tone,
                      color: priority.text,
                      fontWeight: 600
                    }}
                  />

                  <Stack spacing={0.2}>
                    <Typography variant="caption" color="text.secondary">
                      Créé: {row.createdBy}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={row.approvedBy ? "success.main" : "warning.main"}
                    >
                      {row.approvedBy ? `Approuvé: ${row.approvedBy}` : "En attente"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      SoD conforme
                    </Typography>
                  </Stack>

                  <Stack spacing={0.4}>
                    <Typography variant="body2" color="primary" fontWeight={600}>
                      {row.expectedDeliveryDate
                        ? formatProcurementDate(row.expectedDeliveryDate)
                        : "-"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Délai fournisseur: 5j
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    {row.status === "PendingApproval" ? (
                      <Button variant="contained" size="small" onClick={() => onApprove?.(row)}>
                        Approuver
                      </Button>
                    ) : ["Approved", "SentToSupplier", "PartiallyReceived"].includes(row.status) ? (
                      <Button variant="outlined" size="small" onClick={() => onReceive?.(row)}>
                        Réceptionner
                      </Button>
                    ) : (
                      <IconButton size="small" component={Link} href={`/${locale}/procurement/${row.id}`}>
                        <VisibilityOutlined fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" onClick={(event) => openMenu(event, row)}>
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          component={Link}
          href={
            activeRow ? `/${locale}/procurement/${activeRow.id}` : `/${locale}/procurement`
          }
          onClick={closeMenu}
        >
          <VisibilityOutlined fontSize="small" style={{ marginRight: 8 }} />
          Voir détails
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (activeRow) {
              openProcurementPrintPreview(activeRow);
            }
            closeMenu();
          }}
        >
          <DownloadOutlined fontSize="small" style={{ marginRight: 8 }} />
          Télécharger PDF
        </MenuItem>
        {activeRow && activeRow.status === "PendingApproval" ? (
          <MenuItem
            onClick={() => {
              onReject?.(activeRow);
              closeMenu();
            }}
          >
            <ThumbDownOutlined fontSize="small" style={{ marginRight: 8 }} />
            Rejeter
          </MenuItem>
        ) : null}
        {activeRow && ["Approved", "SentToSupplier", "PartiallyReceived"].includes(activeRow.status) ? (
          <MenuItem
            onClick={() => {
              onReceive?.(activeRow);
              closeMenu();
            }}
          >
            <ReceiptLongOutlined fontSize="small" style={{ marginRight: 8 }} />
            Réceptionner
          </MenuItem>
        ) : null}
        <MenuItem
          onClick={() => {
            if (activeRow) {
              onHistory?.(activeRow);
            }
            closeMenu();
          }}
        >
          <HistoryOutlined fontSize="small" style={{ marginRight: 8 }} />
          Historique
        </MenuItem>
      </Menu>
    </Box>
  );
}
