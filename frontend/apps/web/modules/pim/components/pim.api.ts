// apps/web/modules/pim/components/pim.api.ts
import type { Product, ProductListParams, ProductListResponse } from './pim.types';

const BFF = process.env.NEXT_PUBLIC_BFF_BASE_URL ?? 'http://localhost:4000';

async function bffFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    let msg = `BFF ${res.status}`;
    try { const b = await res.json(); msg = b?.error?.message ?? msg; } catch { /* */ }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export async function fetchProducts(params: ProductListParams = {}): Promise<ProductListResponse> {
  const q = new URLSearchParams();
  if (params.page)     q.set('page',     String(params.page));
  if (params.pageSize) q.set('pageSize', String(params.pageSize));
  if (params.status)   q.set('status',   params.status);
  return bffFetch<ProductListResponse>(`${BFF}/bff/pim?${q.toString()}`);
}

export async function fetchProductById(id: string): Promise<{ data: Product }> {
  return bffFetch<{ data: Product }>(`${BFF}/bff/pim/${id}`);
}
