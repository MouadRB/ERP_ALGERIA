// apps/web/modules/pim/components/pim.helpers.ts
import type { Product, TvaRate, ProductStatus } from './pim.types';

export const TVA_RATES: Record<TvaRate, number> = { standard: 0.19, reduced: 0.09, exempt: 0 };

export const STATUS_LABELS: Record<ProductStatus, string> = {
  active: 'Actif', draft: 'Brouillon', archived: 'Archivé',
  discontinued: 'Discontinué', signaled: 'Signalé', ocr_import: 'Import OCR',
};

export function getTotalStock(p: Product): number {
  return p.variants.reduce((s, v) => s + v.stock, 0);
}
export function getRuptureCount(p: Product): number {
  return p.variants.filter((v) => v.stock === 0).length;
}
export function getTvaAmount(priceTTC: number, priceHT: number): number { return priceTTC - priceHT }
export function getTvaPercent(tvaRate: TvaRate): number { return Math.round(TVA_RATES[tvaRate] * 100) }
export function getTvaLabel(tvaRate: TvaRate): string {
  return { standard: '19%', reduced: '9%', exempt: '0%' }[tvaRate] ?? tvaRate;
}
export function formatDZD(n: number): string { return `${n.toLocaleString('fr-DZ')} DZD` }
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'short', year: 'numeric' });
}
