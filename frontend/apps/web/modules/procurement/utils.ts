"use client";

import { formatDZD, getWilayaByCode, type BonCommande } from "@ferza/shared";

export type ProcurementPriority = "urgent" | "high" | "normal" | "low";

export const formatProcurementDate = (value?: string | null) => {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("fr-DZ", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date(value));
  } catch {
    return value.split("T")[0];
  }
};

export const getProcurementPriority = (bc: BonCommande) => {
  if (bc.status === "PendingApproval") {
    return {
      key: "urgent" as const,
      label: "Urgente",
      tone: "#FDE2E2",
      text: "#C62828",
      accent: "#E53935"
    };
  }
  if (bc.totalTTC > 1_000_000) {
    return {
      key: "high" as const,
      label: "Haute",
      tone: "#FFF3D1",
      text: "#B76E00",
      accent: "#F59E0B"
    };
  }
  if (bc.totalTTC > 450_000) {
    return {
      key: "normal" as const,
      label: "Normale",
      tone: "#E7F3FF",
      text: "#1E5FBF",
      accent: "#3B82F6"
    };
  }
  return {
    key: "low" as const,
    label: "Basse",
    tone: "#F1F5F9",
    text: "#64748B",
    accent: "#94A3B8"
  };
};

export const matchesProcurementRange = (value: string, range: string) => {
  const date = new Date(value);
  const now = new Date();
  const days =
    range === "quarter" ? 90 : range === "semester" ? 180 : range === "year" ? 365 : 31;
  const minDate = new Date(now);
  minDate.setDate(now.getDate() - days);
  return date >= minDate;
};

export const downloadProcurementCsv = (rows: BonCommande[], filename = "procurement-export.csv") => {
  if (typeof window === "undefined") return;

  const header = [
    "Reference",
    "Supplier",
    "Wilaya",
    "Status",
    "Items",
    "TotalTTC",
    "ExpectedDelivery",
    "CreatedAt"
  ];

  const body = rows.map((row) => [
    row.reference,
    row.supplierName,
    getWilayaByCode(row.wilayaCode)?.name ?? row.wilayaCode,
    row.status,
    row.items.map((item) => `${item.sku} x${item.quantityOrdered}`).join(" | "),
    String(row.totalTTC),
    row.expectedDeliveryDate ?? "",
    row.createdAt
  ]);

  const csv = [header, ...body]
    .map((line) =>
      line
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
};

export const openProcurementPrintPreview = (bc: BonCommande) => {
  if (typeof window === "undefined") return;

  const popup = window.open("", "_blank", "width=900,height=700");
  if (!popup) return;

  const rows = bc.items
    .map(
      (item) => `
        <tr>
          <td>${item.sku}</td>
          <td>${item.nameFr}</td>
          <td>${item.quantityOrdered}</td>
          <td>${item.quantityReceived}</td>
          <td>${formatDZD(item.unitPriceHT)}</td>
        </tr>
      `
    )
    .join("");

  popup.document.write(`
    <html>
      <head>
        <title>${bc.reference}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
          h1 { margin-bottom: 8px; }
          .meta { margin-bottom: 24px; color: #475569; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          th { background: #eff6ff; }
          .totals { margin-top: 24px; }
        </style>
      </head>
      <body>
        <h1>${bc.reference}</h1>
        <div class="meta">
          <div>Fournisseur: ${bc.supplierName}</div>
          <div>Wilaya: ${getWilayaByCode(bc.wilayaCode)?.name ?? bc.wilayaCode}</div>
          <div>Statut: ${bc.status}</div>
          <div>Livraison prévue: ${formatProcurementDate(bc.expectedDeliveryDate)}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Article</th>
              <th>Qté commandée</th>
              <th>Qté reçue</th>
              <th>Prix HT</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="totals">
          <div>Total HT: ${formatDZD(bc.totalHT)}</div>
          <div>TVA: ${formatDZD(bc.totalTVA)}</div>
          <div>Total TTC: ${formatDZD(bc.totalTTC)}</div>
        </div>
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();
  popup.print();
};
