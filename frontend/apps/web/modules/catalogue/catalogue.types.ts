export type CatalogueStatus =
  | 'draft'
  | 'published'
  | 'scheduled'
  | 'masked'
  | 'partial';

export type CatalogueStockStatus =
  | 'rupture'
  | 'faible'
  | 'en-stock'
  | 'indisponible';

export interface CatalogueChannelDetail {
  id: string;
  label: string;
  subtitle: string;
  status: CatalogueStatus | 'draft';
  indexed: boolean;
  searchRank: number | null;
  activeKeywords: number;
  featuredPlacement: string;
}

export interface CatalogueVisibilityRules {
  minStock: number;
  showOutOfStock: boolean;
  autoMaskOnZeroStock: boolean;
  allowedWilayasCount: number;
  hiddenWilayas: string[];
}

export interface CatalogueMetrics {
  views7d: number;
  addToCartRate: number;
  conversionRate: number;
  topSearchTerm: string;
  returnRate: number;
}

export interface CatalogueHistoryItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  actor: string;
  at: string;
  note?: string;
  noteTone?: 'danger' | 'info' | 'neutral' | 'success' | 'warning';
}

export interface CatalogueInventorySummary {
  sku: string;
  productId?: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  softReserved: number;
  hardReserved: number;
  quantityQuarantined: number;
  reorderPoint: number;
  stockStatus: CatalogueStockStatus;
  lastMovementAt?: string | null;
  costFifo?: number;
  stockValue?: number;
  availableValue?: number;
  weightedAverageCost?: number;
  suggestedReorderQty?: number;
  fifoLayers?: Array<{
    layerId: string;
    receivedAt: string;
    quantityInitial: number;
    quantityRemaining: number;
    unitCostHT: number;
  }>;
  reservations?: Array<{
    reservationId: string;
    orderId: string;
    quantity: number;
    reservedAt: string;
    type: string;
  }>;
  warehouseBreakdown?: Array<{
    warehouseId: string;
    warehouseName: string;
    zone: string;
    isPrimary: boolean;
    available: number;
    soft: number;
    hard: number;
    quarantine: number;
    total: number;
    value: number;
  }>;
}

export interface CatalogueProductSummary {
  id: string;
  sku: string;
  nameFr: string;
  nameAr: string;
  priceTTC: number;
  mediaUrls?: string[];
  returnRate?: number;
  variants?: Array<{
    variantId: string;
    sku: string;
    attributes: Record<string, string>;
    priceTTC: number;
  }>;
  supplierName?: string;
}

export interface CatalogueEntry {
  id: string;
  productId: string;
  sku: string;
  nameFr: string;
  nameAr: string;
  categoryId: string;
  categoryPath: string;
  priceTTC: number;
  status: CatalogueStatus;
  publishedAt: string | null;
  channels: string[];
  openSearchIndexed: boolean;
  openSearchIndexedAt: string | null;
  scheduledPublishAt: string | null;
  scheduledUnpublishAt: string | null;
  channelDetails: CatalogueChannelDetail[];
  visibilityRules: CatalogueVisibilityRules;
  metrics: CatalogueMetrics;
  history: CatalogueHistoryItem[];
  product?: CatalogueProductSummary | null;
  inventory?: CatalogueInventorySummary | null;
  relatedProducts?: Array<{
    id: string;
    sku: string;
    nameFr: string;
    priceTTC: number;
    status: CatalogueStatus;
  }>;
  seo?: {
    metaTitleFr: string;
    metaTitleAr: string;
    slug: string;
  };
  variantCount: number;
  channelCount: number;
  availableStock: number;
  reservedStock: number;
  stockStatus: CatalogueStockStatus;
  allowedWilayasLabel: string;
}

export interface OpenSearchStatus {
  totalIndexed: number;
  totalPublished: number;
  lastIndexedAt: string | null;
  health: 'green' | 'yellow' | 'red';
}
