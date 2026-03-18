export type ProductStatus = 'draft' | 'active' | 'archived';

export interface ProductVariant {
  variantId: string;
  sku: string;
  attributes: Record<string, string>; // e.g. { color: "rouge", size: "L" }
  priceTTC: number;                   // DZD
  stock: number;
}

export interface Product {
  id: string;
  sku: string;
  nameFr: string;
  nameAr: string;
  descriptionFr: string;
  descriptionAr: string;
  categoryId: string;
  brandId: string;
  priceHT: number;             // DZD
  tvaRate: 'standard' | 'reduced' | 'exempt';
  priceTTC: number;            // DZD
  status: ProductStatus;
  variants: ProductVariant[];
  mediaUrls: string[];
  weightKg: number | null;
  dimensions: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  } | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}