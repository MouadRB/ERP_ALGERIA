// apps/web/modules/pim/index.ts
export type { Product, ProductVariant, ProductStatus, TvaRate, ProductListResponse, ProductListMeta, ProductListParams } from './pim.types';
export { TVA_RATES, getTotalStock, getRuptureCount, getTvaAmount, getTvaPercent, getTvaLabel, formatDZD, formatDate } from './pim.helpers';
export { fetchProducts, fetchProductById } from './pim.api';
export { default as PimStatusBadge }    from './PimStatusBadge';
export { default as PimStatsBar }       from './PimStatsBar';
export type { PimStats }                from './PimStatsBar';
export { default as PimTable }          from './PimTable';
export { default as PimDetailPanel }    from './PimDetailPanel';
export { default as PimDetailSidebar }  from './PimDetailSidebar';
export { default as OcrImportModal }    from './OcrImportModal';
