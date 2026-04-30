"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Box, Card, CardContent, Stack } from "@mui/material";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/shared/useToast";
import type { BonCommande } from "@ferza/shared";
import { useProcurementBCs } from "@/modules/procurement/hooks/useProcurementBCs";
import { useCreateBC } from "@/modules/procurement/hooks/useCreateBC";
import { useApproveBC } from "@/modules/procurement/hooks/useApproveBC";
import { useRejectBC } from "@/modules/procurement/hooks/useRejectBC";
import { useReceiveBC } from "@/modules/procurement/hooks/useReceiveBC";
import { useSuppliers } from "@/modules/procurement/hooks/useSuppliers";
import { useProcurementAlerts } from "@/modules/procurement/hooks/useProcurementAlerts";
import BCTable from "@/modules/procurement/components/list/BCTable";
import AlertsTab from "@/modules/procurement/components/list/AlertsTab";
import ProcurementAlerts from "@/modules/procurement/components/list/ProcurementAlerts";
import ProcurementHeader from "@/modules/procurement/components/list/ProcurementHeader";
import ProcurementStats from "@/modules/procurement/components/list/ProcurementStats";
import ProcurementFilters from "@/modules/procurement/components/list/ProcurementFilters";
import ProcurementTabs, {
  type ProcurementTabValue
} from "@/modules/procurement/components/list/ProcurementTabs";
import ProcurementAnalytics from "@/modules/procurement/components/analytics/ProcurementAnalytics";
import NewBCWizard from "@/modules/procurement/components/modals/NewBCWizard";
import ApproveBCModal from "@/modules/procurement/components/modals/ApproveBCModal";
import RejectBCModal from "@/modules/procurement/components/modals/RejectBCModal";
import ReceiveStockModal from "@/modules/procurement/components/modals/ReceiveStockModal";
import SupplierGrid from "@/modules/procurement/components/suppliers/SupplierGrid";
import {
  downloadProcurementCsv,
  getProcurementPriority,
  matchesProcurementRange
} from "@/modules/procurement/utils";

type ProcurementSupplier = {
  id: string;
  name: string;
  wilayaCode: string;
  phone: string;
  email: string | null;
  totalBCs: number;
};

type ProcurementAlert = {
  id: string;
  type?: string;
  severity: "info" | "warning" | "error";
  message: string;
};

export default function ProcurementPage() {
  const params = useParams();
  const router = useRouter();
  const locale = typeof params?.locale === "string" ? params.locale : "fr";
  const { data, isLoading, refetch } = useProcurementBCs();
  const suppliersQuery = useSuppliers();
  const alertsQuery = useProcurementAlerts();
  const queryClient = useQueryClient();
  const createBC = useCreateBC();
  const approveBC = useApproveBC();
  const rejectBC = useRejectBC();
  const receiveBC = useReceiveBC();
  const { toasts, showToast, dismissToast } = useToast();
  const [tab, setTab] = useState<ProcurementTabValue>("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BonCommande["status"] | "all">(
    "all"
  );
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [rangeFilter, setRangeFilter] = useState("month");
  const [sortFilter, setSortFilter] = useState("createdDesc");
  const [showApprovalAlert, setShowApprovalAlert] = useState(true);
  const [showStockAlert, setShowStockAlert] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardSupplier, setWizardSupplier] = useState("");
  const [approveTarget, setApproveTarget] = useState<BonCommande | null>(null);
  const [rejectTarget, setRejectTarget] = useState<BonCommande | null>(null);
  const [receiveTarget, setReceiveTarget] = useState<BonCommande | null>(null);

  const rows = useMemo(() => data?.data ?? [], [data?.data]);
  const supplierRecords = useMemo(
    () => (suppliersQuery.data?.data as ProcurementSupplier[] | undefined) ?? [],
    [suppliersQuery.data?.data]
  );
  const supplierOptions = useMemo(() => {
    const names = new Set(rows.map((row) => row.supplierName));
    supplierRecords.forEach((supplier) => names.add(supplier.name));
    return Array.from(names.values());
  }, [rows, supplierRecords]);

  const alerts = useMemo<ProcurementAlert[]>(() => {
    const liveAlerts = alertsQuery.data?.data as ProcurementAlert[] | undefined;
    if (liveAlerts?.length) return liveAlerts;
    return rows.slice(0, 3).map((row) => ({
      id: `alert-${row.id}`,
      message:
        row.status === "PendingApproval"
          ? `${row.reference} en attente d'approbation.`
          : `${row.reference} attendu le ${
              row.expectedDeliveryDate ? row.expectedDeliveryDate.split("T")[0] : "-"
            }.`,
      severity:
        row.status === "Rejected"
          ? "error"
          : row.status === "PendingApproval"
          ? "warning"
          : "info"
    }));
  }, [alertsQuery.data, rows]);

  const filteredRows = useMemo(() => {
    const query = search.toLowerCase().trim();
    const list = rows.filter((row) => {
      const matchesSearch =
        query.length === 0 ||
        row.reference.toLowerCase().includes(query) ||
        row.supplierName.toLowerCase().includes(query) ||
        row.items.some(
          (item) =>
            item.sku.toLowerCase().includes(query) ||
            item.nameFr.toLowerCase().includes(query)
        );
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const matchesSupplier =
        supplierFilter === "all" || row.supplierName === supplierFilter;
      const matchesPriority =
        priorityFilter === "all" || getProcurementPriority(row).key === priorityFilter;
      const matchesRange = matchesProcurementRange(row.createdAt, rangeFilter);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSupplier &&
        matchesPriority &&
        matchesRange
      );
    });

    return [...list].sort((left, right) => {
      switch (sortFilter) {
        case "createdAsc":
          return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
        case "amountDesc":
          return right.totalTTC - left.totalTTC;
        case "amountAsc":
          return left.totalTTC - right.totalTTC;
        default:
          return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      }
    });
  }, [
    priorityFilter,
    rangeFilter,
    rows,
    search,
    sortFilter,
    statusFilter,
    supplierFilter
  ]);

  const totalSpend = rows.reduce((sum, row) => sum + row.totalTTC, 0);
  const pendingApprovals = rows.filter((row) => row.status === "PendingApproval").length;
  const inSupplier = rows.filter((row) => row.status === "SentToSupplier").length;
  const inTransit = rows.filter((row) => row.status === "PartiallyReceived").length;
  const received = rows.filter((row) =>
    ["FullyReceived", "Invoiced"].includes(row.status)
  ).length;
  const suppliersCount = supplierOptions.length;
  const draftCount = rows.filter((row) => row.status === "Draft").length;
  const transitCount = rows.filter((row) =>
    ["SentToSupplier", "PartiallyReceived"].includes(row.status)
  ).length;
  const stockAlerts = alerts.filter(
    (alert) => alert.type !== "approval" && alert.severity !== "info"
  ).length;
  const receiptRows = rows.filter((row) =>
    ["Approved", "SentToSupplier", "PartiallyReceived", "FullyReceived", "Invoiced"].includes(
      row.status
    )
  );

  const handleActionError = (error: unknown, fallback: string) => {
    if (error instanceof Error) {
      showToast(error.message, "error");
      return;
    }
    showToast(fallback, "error");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {isLoading ? <LoadingState label="Chargement de l'approvisionnement..." /> : null}

      <ProcurementAlerts
        pendingApprovals={pendingApprovals}
        stockAlerts={stockAlerts}
        showApprovalAlert={showApprovalAlert}
        showStockAlert={showStockAlert}
        onOpenApprovals={() => {
          setTab("list");
          setStatusFilter("PendingApproval");
        }}
        onCreateGroupedBC={() => {
          setWizardSupplier("");
          setWizardOpen(true);
        }}
        onCloseApproval={() => setShowApprovalAlert(false)}
        onCloseStock={() => setShowStockAlert(false)}
      />

      <ProcurementHeader
        totalCount={rows.length}
        suppliersCount={suppliersCount}
        stockAlerts={stockAlerts}
        onNewBC={() => {
          setWizardSupplier("");
          setWizardOpen(true);
        }}
        onAnalytics={() => setTab("analytics")}
        onExport={() => {
          downloadProcurementCsv(filteredRows);
          showToast("Export CSV généré", "success");
        }}
        onShowAlerts={() => setTab("alerts")}
      />

      <ProcurementStats
        pendingApprovals={pendingApprovals}
        inSupplier={inSupplier}
        inTransit={inTransit}
        received={received}
        stockAlerts={stockAlerts}
        totalSpend={totalSpend}
      />

      <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "#E2E8F0" }}>
        <ProcurementTabs
          value={tab}
          onChange={setTab}
          counts={{
            list: rows.length,
            alerts: stockAlerts,
            suppliers: suppliersCount,
            receipts: receiptRows.length
          }}
        />
        <CardContent sx={{ paddingTop: 2 }}>
          <Stack spacing={2}>
            {tab === "list" ? (
              <ProcurementFilters
                search={search}
                onSearchChange={setSearch}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                supplierFilter={supplierFilter}
                onSupplierChange={setSupplierFilter}
                priorityFilter={priorityFilter}
                onPriorityChange={setPriorityFilter}
                rangeFilter={rangeFilter}
                onRangeChange={setRangeFilter}
                sortFilter={sortFilter}
                onSortChange={setSortFilter}
                supplierOptions={supplierOptions}
                draftCount={draftCount}
                pendingApprovals={pendingApprovals}
                transitCount={transitCount}
              />
            ) : null}

            {tab === "list" ? (
              filteredRows.length === 0 && !isLoading ? (
                <EmptyState title="Aucun BC trouvé" description="Ajustez les filtres." />
              ) : (
                <BCTable
                  rows={filteredRows}
                  locale={locale}
                  loading={isLoading}
                  onApprove={setApproveTarget}
                  onReject={setRejectTarget}
                  onReceive={setReceiveTarget}
                  onHistory={(row) => router.push(`/${locale}/procurement/${row.id}?tab=audit`)}
                />
              )
            ) : null}

            {tab === "alerts" ? <AlertsTab alerts={alerts} /> : null}

            {tab === "suppliers" ? (
              suppliersQuery.isLoading ? (
                <LoadingState label="Chargement des fournisseurs..." />
              ) : supplierRecords.length === 0 ? (
                <EmptyState title="Fournisseurs" description="Aucun fournisseur disponible." />
              ) : (
                <SupplierGrid
                  suppliers={supplierRecords}
                  onCreateBC={(supplier) => {
                    setWizardSupplier(supplier.name);
                    setWizardOpen(true);
                  }}
                />
              )
            ) : null}

            {tab === "receipts" ? (
              receiptRows.length === 0 ? (
                <EmptyState title="Réceptions" description="Aucune réception à traiter." />
              ) : (
                <BCTable
                  rows={receiptRows}
                  locale={locale}
                  loading={isLoading}
                  onApprove={setApproveTarget}
                  onReject={setRejectTarget}
                  onReceive={setReceiveTarget}
                  onHistory={(row) => router.push(`/${locale}/procurement/${row.id}?tab=audit`)}
                />
              )
            ) : null}

            {tab === "analytics" ? (
              <ProcurementAnalytics rows={rows} alerts={alerts} />
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      <NewBCWizard
        open={wizardOpen}
        onClose={() => {
          setWizardOpen(false);
          setWizardSupplier("");
        }}
        suppliers={supplierOptions}
        initialSupplier={wizardSupplier}
        submitting={createBC.isPending}
        onSubmit={async (payload) => {
          try {
            await createBC.mutateAsync(payload);
            setTab("list");
            showToast("Bon de commande créé", "success");
            return true;
          } catch {
            const now = new Date().toISOString();
            const items = payload.items ?? [];
            const totalHT = items.reduce(
              (sum, item) => sum + item.quantityOrdered * item.unitPriceHT,
              0
            );
            const totalTVA = items.reduce((sum, item) => {
              const rate =
                item.tvaRate === "reduced" ? 0.09 : item.tvaRate === "exempt" ? 0 : 0.19;
              return sum + item.quantityOrdered * item.unitPriceHT * rate;
            }, 0);
            const totalTTC = totalHT + totalTVA;
            const localBc: BonCommande = {
              id: `BC-LOCAL-${Date.now()}`,
              reference: `BC-LOCAL-${Math.floor(Math.random() * 900 + 100)}`,
              supplierId: payload.supplierId ?? "SUPP-LOCAL",
              supplierName: payload.supplierName ?? "Fournisseur",
              wilayaCode: payload.wilayaCode ?? "16",
              items,
              totalHT,
              totalTVA,
              totalTTC,
              status: "PendingApproval",
              createdBy: "local-user",
              approvedBy: null,
              rejectedBy: null,
              rejectionReason: null,
              autoCancelAt: null,
              expectedDeliveryDate: payload.expectedDeliveryDate ?? null,
              createdAt: now,
              updatedAt: now
            };

            queryClient.setQueriesData(
              { queryKey: ["procurement", "bcs"] },
              (current) => {
                if (!current) return current;
                const typed = current as { data: BonCommande[]; meta?: { total?: number } };
                const existing = typed.data ?? [];
                return {
                  ...typed,
                  data: [localBc, ...existing],
                  meta: {
                    ...typed.meta,
                    total: (typed.meta?.total ?? existing.length) + 1
                  }
                };
              }
            );
            setTab("list");
            showToast("BC créé localement (fallback)", "warning");
            return true;
          }
        }}
      />

      <ApproveBCModal
        open={Boolean(approveTarget)}
        bc={approveTarget}
        submitting={approveBC.isPending}
        onClose={() => setApproveTarget(null)}
        onConfirm={async () => {
          if (!approveTarget) return;
          try {
            await approveBC.mutateAsync(approveTarget.id);
            showToast(`${approveTarget.reference} approuvé`, "success");
            setApproveTarget(null);
            refetch();
          } catch (error) {
            handleActionError(error, "Impossible d'approuver le BC.");
          }
        }}
      />

      <RejectBCModal
        open={Boolean(rejectTarget)}
        bc={rejectTarget}
        submitting={rejectBC.isPending}
        onClose={() => setRejectTarget(null)}
        onConfirm={async (reason) => {
          if (!rejectTarget) return;
          try {
            await rejectBC.mutateAsync({ id: rejectTarget.id, reason });
            showToast(`${rejectTarget.reference} rejeté`, "success");
            setRejectTarget(null);
            refetch();
          } catch (error) {
            handleActionError(error, "Impossible de rejeter le BC.");
          }
        }}
      />

      <ReceiveStockModal
        open={Boolean(receiveTarget)}
        bc={receiveTarget}
        submitting={receiveBC.isPending}
        onClose={() => setReceiveTarget(null)}
        onConfirm={async (items) => {
          if (!receiveTarget) return;
          try {
            await receiveBC.mutateAsync({ id: receiveTarget.id, items });
            showToast(`Réception enregistrée pour ${receiveTarget.reference}`, "success");
            setReceiveTarget(null);
            refetch();
          } catch (error) {
            handleActionError(error, "Impossible d'enregistrer la réception.");
          }
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
