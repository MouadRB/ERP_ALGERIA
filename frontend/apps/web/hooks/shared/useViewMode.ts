'use client';

import { useSearchParams } from 'next/navigation';

/**
 * Reads ?mode=view from the URL to determine read-only state.
 * Used by PIM and Catalogue detail pages.
 */
export const useViewMode = () => {
  const searchParams = useSearchParams();
  const isReadOnly = searchParams.get('mode') === 'view';
  return { isReadOnly };
};
