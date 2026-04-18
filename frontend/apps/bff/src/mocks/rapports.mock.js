/**
 * RAPPORT MOCK — DEPRECATED (SYNC-11)
 *
 * Rapport owns NOTHING. All metrics are computed LIVE by rapports.service.js
 * via module-specific adapters (oms.adapter, crm.adapter, inventory.adapter,
 * pim.adapter, catalogue.adapter, procurement.adapter).
 *
 * This file is kept only as static metadata (available report types, etc.).
 * Pre-computed KPIs (totalRevenueTTC, totalOrders, etc.) have been removed
 * because they drift from the actual module state.
 */

module.exports = {
  availableReports: [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'Dashboard' },
    { id: 'ventes', label: 'Ventes & OMS', icon: 'ShoppingCart' },
    { id: 'produits', label: 'Produits & Catalogue', icon: 'Inventory' },
    { id: 'inventaire', label: 'Inventaire & Stock', icon: 'Warehouse' },
    { id: 'clients', label: 'Clients & CRM', icon: 'People' },
    { id: 'approvisionnement', label: 'Approvisionnement', icon: 'LocalShipping' },
    { id: 'cross-module', label: 'Inter-modules', icon: 'Hub' },
  ],
  periodOptions: [
    { value: 'today', label: "Aujourd'hui" },
    { value: '7d', label: '7 derniers jours' },
    { value: '30d', label: '30 derniers jours' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette annee' },
  ],
};
