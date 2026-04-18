'use client';

import { useMemo, useState } from 'react';
import { Box, Snackbar } from '@mui/material';
import { useParams } from 'next/navigation';
import OcrImportModal from '@/modules/pim/components/OcrImportModal';
import PimStatsBar from '@/modules/pim/components/PimStatsBar';
import PimTable from '@/modules/pim/components/PimTable';
import NewProductWizard from '@/modules/pim/components/modals/NewProductWizard';
import PimPageHeader from '@/modules/pim/components/page/PimPageHeader';
import { usePIMProducts } from '@/modules/pim/hooks/usePIMProducts';

const INITIAL_PARAMS = {
  page: '1',
  pageSize: '20',
  status: '',
  search: '',
  categoryId: '',
  supplier: '',
  sortBy: 'updatedAt',
  sortOrder: 'desc' as 'asc' | 'desc',
};

export default function PimPage() {
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'fr';
  const [queryParams, setQueryParams] = useState(INITIAL_PARAMS);
  const [ocrOpen, setOcrOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState('');

  const { data, isLoading } = usePIMProducts({
    page: Number(queryParams.page),
    pageSize: Number(queryParams.pageSize),
    search: queryParams.search,
    status: queryParams.status,
    categoryId: queryParams.categoryId,
    supplier: queryParams.supplier,
    sortBy: queryParams.sortBy,
    sortOrder: queryParams.sortOrder,
  });

  const products = data?.data ?? [];
  const meta = {
    total: data?.meta?.total ?? products.length,
    page: data?.meta?.page ?? Number(queryParams.page),
    pageSize: data?.meta?.pageSize ?? Number(queryParams.pageSize),
  };

  const stats = useMemo(
    () => ({
      active: products.filter((product) => product.status === 'active').length,
      pending: products.filter((product) => product.status === 'draft').length,
      highReturn: products.filter((product) => (product.returnRate ?? 0) >= 0.3).length,
      variantesActives: products.reduce((sum, product) => sum + product.variants.length, 0),
      ocrRevision: products.filter((product) => product.status === 'ocr_import').length,
    }),
    [products],
  );

  const handleExport = () => {
    const csv = [
      ['SKU', 'Nom FR', 'Categorie', 'Prix TTC', 'Statut'].join(','),
      ...products.map((product) =>
        [product.sku, product.nameFr, product.categoryId, product.priceTTC, product.status].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'pim-products.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    setToast('Export CSV genere.');
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PimPageHeader
        total={meta.total}
        onExport={handleExport}
        onOpenOcr={() => setOcrOpen(true)}
        onOpenCreate={() => setCreateOpen(true)}
      />

      <PimStatsBar stats={stats} />

      <PimTable
        products={products}
        meta={meta}
        locale={locale}
        currentParams={queryParams}
        onParamsChange={(next) =>
          setQueryParams((current) => ({
            ...current,
            ...next,
            sortOrder: (next.sortOrder as 'asc' | 'desc') ?? current.sortOrder,
          }))
        }
        loading={isLoading}
      />

      <OcrImportModal open={ocrOpen} onClose={() => setOcrOpen(false)} />
      <NewProductWizard open={createOpen} onClose={() => setCreateOpen(false)} />
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2500}
        onClose={() => setToast('')}
        message={toast}
      />
    </Box>
  );
}
