// apps/web/modules/pim/components/pim.types.ts

export type ProductStatus = 'active' | 'draft' | 'archived' | 'discontinued' | 'signaled' | 'ocr_import';
export type TvaRate = 'standard' | 'reduced' | 'exempt';

export interface ProductVariant {
  variantId: string;
  sku: string;
  attributes: Record<string, string>;
  priceTTC: number;
  stock: number;
}
export interface ProductDimensions { lengthCm: number; widthCm: number; heightCm: number }

export interface Product {
  id: string; sku: string;
  nameFr: string; nameAr: string;
  descriptionFr: string; descriptionAr: string;
  categoryId: string; brandId: string;
  supplierName?: string; supplierRef?: string;
  priceHT: number; tvaRate: TvaRate; priceTTC: number;
  costFifo?: number;
  status: ProductStatus;
  signaled?: boolean;
  returnRate?: number;
  stockSeuil?: number;
  mdmConfirmed?: boolean;
  variants: ProductVariant[];
  mediaUrls: string[];
  weightKg: number;
  dimensions: ProductDimensions | null;
  wilayasRestreintes?: string[];
  returnPolicy?: string;
  createdBy: string; createdAt: string; updatedAt: string;
}

export interface ProductListMeta { total: number; page: number; pageSize: number }
export interface ProductListResponse { data: Product[]; meta: ProductListMeta }
export interface ProductListParams { page?: number | string; pageSize?: number | string; status?: string }
