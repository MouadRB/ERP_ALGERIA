"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Box, Button, Card, Divider, Grid, Stack, Tab, Tabs } from "@mui/material";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import StatusChip from "@/components/ui/StatusChip";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/shared/useToast";
import { useProcurementBC } from "@/modules/procurement/hooks/useProcurementBC";
import { useApproveBC } from "@/modules/procurement/hooks/useApproveBC";
import { useRejectBC } from "@/modules/procurement/hooks/useRejectBC";
import { useReceiveBC } from "@/modules/procurement/hooks/useReceiveBC";
import ArticlesMontantsTab from "@/modules/procurement/components/detail/tabs/ArticlesMontantsTab";
import FournisseurTab from "@/modules/procurement/components/detail/tabs/FournisseurTab";
import SoDApprobationTab from "@/modules/procurement/components/detail/tabs/SoDApprobationTab";
import SuiviLivraisonTab from "@/modules/procurement/components/detail/tabs/SuiviLivraisonTab";
import HistoriqueAuditTab from "@/modules/procurement/components/detail/tabs/HistoriqueAuditTab";
import ResumeCard from "@/modules/procurement/components/detail/sidebar/ResumeCard";
import FournisseurCard from "@/modules/procurement/components/detail/sidebar/FournisseurCard";
import ApprobationSoDCard from "@/modules/procurement/components/detail/sidebar/ApprobationSoDCard";
import ImpactInventaireCard from "@/modules/procurement/components/detail/sidebar/ImpactInventaireCard";
import AuditLogCard from "@/modules/procurement/components/detail/sidebar/AuditLogCard";
import ApproveBCModal from "@/modules/procurement/components/modals/ApproveBCModal";
import RejectBCModal from "@/modules/procurement/components/modals/RejectBCModal";
import ReceiveStockModal from "@/modules/procurement/components/modals/ReceiveStockModal";
import LitigeFournisseurModal from "@/modules/procurement/components/modals/LitigeFournisseurModal";
import type { BonCommande } from "@ferza/shared";

type ApprovalStep = {
  step: string;
  status: "pending" | "approved" | "rejected";
  owner: string;
};

type AuditEntry = {
  id: string;
  action: string;
  at: string;
  by: string;
};

const statusLabel = (status: BonCommande["status"]) => {
  switch (status) {
    case "Draft":
      return "Brouillon";
    case "PendingApproval":
      return "En attente approbation";
    case "Approved":
      return "Approuvé";
    case "SentToSupplier":
      return "Envoyé fournisseur";
    case "PartiallyReceived":
      return "Partiellement reçu";
    case "FullyReceived":
      return "Réceptionné";
    case "Invoiced":
      return "Facturé";
    case "Rejected":
      return "Refusé";
    case "Cancelled":
      return "Annulé";
    default:
      return status;
  }
};

const statusColor = (status: BonCommande["status"]) => {
  switch (status) {
    case "Approved":
    case "FullyReceived":
    case "Invoiced":
      return "success";
    case "Rejected":
    case "Cancelled":
      return "error";
    case "PendingApproval":
    case "SentToSupplier":
    case "PartiallyReceived":
      return "warning";
    default:
      return "default";
  }
};

const buildApprovals = (bc: BonCommande): ApprovalStep[] => {
  const financeStatus = bc.rejectedBy ? "rejected" : bc.approvedBy ? "approved" : "pending";
  const financeOwner = bc.approvedBy ?? bc.rejectedBy ?? "En attente";

  return [
    { step: "Création", status: "approved", owner: bc.createdBy },
    { step: "Finance", status: financeStatus, owner: financeOwner }
  ];
};

const buildAudits = (bc: BonCommande): AuditEntry[] => {
  const audits: AuditEntry[] = [
    { id: "created", action: "Création du BC", at: bc.createdAt, by: bc.createdBy }
  ];

  if (bc.approvedBy) {
    audits.push({ id: "approved", action: "Approbation", at: bc.updatedAt, by: bc.approvedBy });
  }

  if (bc.rejectedBy) {
    audits.push({ id: "rejected", action: "Rejet", at: bc.updatedAt, by: bc.rejectedBy });
  }

  if (bc.expectedDeliveryDate) {
    audits.push({
      id: "expected",
      action: "Livraison prévue",
      at: bc.expectedDeliveryDate,
      by: "Système"
    });
  }

  return audits;
};

export default function ProcurementDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const locale = typeof params?.locale === "string" ? params.locale : "fr";
  const { data, isLoading, refetch } = useProcurementBC(id);
  const approveBC = useApproveBC();
  const rejectBC = useRejectBC();
  const receiveBC = useReceiveBC();
  const { toasts, showToast, dismissToast } = useToast();
  const [tab, setTab] = useState("articles");
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [litigeOpen, setLitigeOpen] = useState(false);
  const [localAudits, setLocalAudits] = useState<AuditEntry[]>([]);

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (requestedTab) {
      setTab(requestedTab);
    }
  }, [searchParams]);

  if (isLoading) {
    return <LoadingState label="Chargement du détail du bon de commande..." />;
  }

  if (!data?.data) {
    return (
      <EmptyState
        title="Bon de commande introuvable"
        description="Le BC demandé est indisponible ou n'existe pas."
      />
    );
  }

  const bc = data.data;
  const approvals = buildApprovals(bc);
  const audits = [...buildAudits(bc), ...localAudits];

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        spacing={2}
      >
        <PageHeader title={`Bon de commande ${bc.reference}`} subtitle={bc.supplierName} />
        <Stack direction="row" spacing={1} alignItems="center">
          <StatusChip label={statusLabel(bc.status)} color={statusColor(bc.status)} />
          <Button component={Link} href={`/${locale}/procurement`} variant="outlined">
            Retour à la liste
          </Button>
          {bc.status === "PendingApproval" ? (
            <>
              <Button variant="outlined" color="error" onClick={() => setRejectOpen(true)}>
                Rejeter
              </Button>
              <Button variant="contained" onClick={() => setApproveOpen(true)}>
                Approuver
              </Button>
            </>
          ) : null}
          {["Approved", "SentToSupplier", "PartiallyReceived"].includes(bc.status) ? (
            <Button variant="contained" color="secondary" onClick={() => setReceiveOpen(true)}>
              Réceptionner
            </Button>
          ) : null}
          <Button variant="text" onClick={() => setLitigeOpen(true)}>
            Ouvrir litige
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card variant="outlined">
            <Tabs
              value={tab}
              onChange={(_event, value) => setTab(value)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Articles & montants" value="articles" />
              <Tab label="Fournisseur" value="supplier" />
              <Tab label="Approbation SoD" value="approvals" />
              <Tab label="Livraison" value="delivery" />
              <Tab label="Audit" value="audit" />
            </Tabs>
            <Divider />
            <Box sx={{ padding: 2 }}>
              {tab === "articles" ? (
                <ArticlesMontantsTab
                  items={bc.items}
                  totalHT={bc.totalHT}
                  totalTVA={bc.totalTVA}
                  totalTTC={bc.totalTTC}
                />
              ) : null}
              {tab === "supplier" ? (
                <FournisseurTab
                  supplierName={bc.supplierName}
                  supplierId={bc.supplierId}
                  wilayaCode={bc.wilayaCode}
                  createdBy={bc.createdBy}
                  approvedBy={bc.approvedBy}
                  rejectedBy={bc.rejectedBy}
                  rejectionReason={bc.rejectionReason}
                />
              ) : null}
              {tab === "approvals" ? <SoDApprobationTab approvals={approvals} /> : null}
              {tab === "delivery" ? (
                <SuiviLivraisonTab
                  status={bc.status}
                  expectedDeliveryDate={bc.expectedDeliveryDate}
                  autoCancelAt={bc.autoCancelAt}
                />
              ) : null}
              {tab === "audit" ? <HistoriqueAuditTab audits={audits} /> : null}
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Stack spacing={2}>
            <ResumeCard
              totalTTC={bc.totalTTC}
              itemsCount={bc.items.length}
              status={bc.status}
              createdAt={bc.createdAt}
              expectedDeliveryDate={bc.expectedDeliveryDate}
            />
            <FournisseurCard
              supplierName={bc.supplierName}
              supplierId={bc.supplierId}
              wilayaCode={bc.wilayaCode}
            />
            <ApprobationSoDCard approvals={approvals} />
            <ImpactInventaireCard wilayaCode={bc.wilayaCode} autoCancelAt={bc.autoCancelAt} />
            <AuditLogCard audits={audits} />
          </Stack>
        </Grid>
      </Grid>

      <ApproveBCModal
        open={approveOpen}
        bc={bc}
        submitting={approveBC.isPending}
        onClose={() => setApproveOpen(false)}
        onConfirm={async () => {
          try {
            await approveBC.mutateAsync(bc.id);
            setApproveOpen(false);
            await refetch();
            showToast(`${bc.reference} approuvé`, "success");
          } catch (error) {
            showToast(error instanceof Error ? error.message : "Approbation impossible", "error");
          }
        }}
      />

      <RejectBCModal
        open={rejectOpen}
        bc={bc}
        submitting={rejectBC.isPending}
        onClose={() => setRejectOpen(false)}
        onConfirm={async (reason) => {
          try {
            await rejectBC.mutateAsync({ id: bc.id, reason });
            setRejectOpen(false);
            await refetch();
            showToast(`${bc.reference} rejeté`, "success");
          } catch (error) {
            showToast(error instanceof Error ? error.message : "Rejet impossible", "error");
          }
        }}
      />

      <ReceiveStockModal
        open={receiveOpen}
        bc={bc}
        submitting={receiveBC.isPending}
        onClose={() => setReceiveOpen(false)}
        onConfirm={async (items) => {
          try {
            await receiveBC.mutateAsync({ id: bc.id, items });
            setReceiveOpen(false);
            await refetch();
            showToast(`Réception enregistrée pour ${bc.reference}`, "success");
          } catch (error) {
            showToast(error instanceof Error ? error.message : "Réception impossible", "error");
          }
        }}
      />

      <LitigeFournisseurModal
        open={litigeOpen}
        bc={bc}
        onClose={() => setLitigeOpen(false)}
        onSubmit={(summary) => {
          setLocalAudits((prev) => [
            {
              id: `dispute-${Date.now()}`,
              action: `Litige fournisseur ouvert: ${summary}`,
              at: new Date().toISOString(),
              by: "utilisateur-courant"
            },
            ...prev
          ]);
          setLitigeOpen(false);
          setTab("audit");
          showToast("Litige fournisseur enregistré", "success");
        }}
      />

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          open
          message={toast.message}
          severity={toast.severity}
          onClose={() => dismissToast(toast.id)}
        />
      ))}
    </Box>
  );
}
