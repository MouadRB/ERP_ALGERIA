'use client';

import { useMemo, useState } from 'react';
import { Box, Snackbar } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/shared/useDebounce';
import StockFilters from '@/modules/inventory/components/StockFilters';
import StockTable from '@/modules/inventory/components/StockTable';
import StockMovementModal, {
  type InventoryMovementMode,
} from '@/modules/inventory/components/modals/StockMovementModal';
import PhysicalInventoryModal from '@/modules/inventory/components/modals/PhysicalInventoryModal';
import InventoryMetricsRow from '@/modules/inventory/components/page/InventoryMetricsRow';
import InventoryPageHeader from '@/modules/inventory/components/page/InventoryPageHeader';
import InventorySelectionBar from '@/modules/inventory/components/page/InventorySelectionBar';
import { useInventoryStock } from '@/modules/inventory/hooks/useInventoryStock';
import { useInventoryStats } from '@/modules/inventory/hooks/useInventoryStats';
import { useCreateMovement } from '@/modules/inventory/hooks/useCreateMovement';
import type { InventoryItem, InventoryStats } from '@/modules/inventory/inventory.types';
import { usePIMProducts } from '@/modules/pim/hooks/usePIMProducts';

const EMPTY_STATS: InventoryStats = {
  stockValue: 0,
  units: 0,
  ruptures: 0,
  lowStock: 0,
  movementsToday: 0,
  movementsTodaySplit: { incoming: 0, outgoing: 0 },
};

export default function InventoryPageContent() {
  const params = useParams();
  const router = useRouter();
  const locale = typeof params.locale === 'string' ? params.locale : 'fr';

  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    sort: 'stock-desc',
    stockStatus: '',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toast, setToast] = useState('');
  const [physicalOpen, setPhysicalOpen] = useState(false);
  const [movementOpen, setMovementOpen] = useState(false);
  const [movementMode, setMovementMode] = useState<InventoryMovementMode>('receipt');
  const [activeSkus, setActiveSkus] = useState<string[]>([]);

  const debouncedSearch = useDebounce(filters.search, 250);

  const listQuery = useInventoryStock({
    page: 1,
    pageSize: 100,
    search: debouncedSearch,
    categoryId: filters.categoryId,
    sort: filters.sort,
    stockStatus: filters.stockStatus,
  });
  const statsQuery = useInventoryStats();
  const catalogQuery = useInventoryStock({ page: 1, pageSize: 100, sort: 'stock-desc' });
  const pimProductsQuery = usePIMProducts({ page: 1, pageSize: 500 });
  const createMovement = useCreateMovement();

  const rowsRaw = listQuery.data?.data ?? [];
  const catalogRows = catalogQuery.data?.data ?? [];
  const stats = statsQuery.data?.data ?? EMPTY_STATS;
  const pimProducts = pimProductsQuery.data?.data ?? [];

  const pimImageBySku = useMemo(() => {
    const map = new Map<string, string>();
    pimProducts.forEach((product) => {
      const image = product.mediaUrls?.[0];
      if (!image) return;
      map.set(product.sku, image);
      product.variants.forEach((variant) => {
        map.set(variant.sku, image);
      });
    });
    return map;
  }, [pimProducts]);

  const pimImageByProductId = useMemo(() => {
    const map = new Map<string, string>();
    pimProducts.forEach((product) => {
      const image = product.mediaUrls?.[0];
      if (!image) return;
      map.set(product.id, image);
    });
    return map;
  }, [pimProducts]);

  const rows = useMemo(
    () =>
      rowsRaw.map((row) => ({
        ...row,
        imageUrl:
          pimImageBySku.get(row.sku) ||
          pimImageByProductId.get(row.productId) ||
          row.imageUrl,
      })),
    [rowsRaw, pimImageByProductId, pimImageBySku],
  );

  const rowsBySku = useMemo(
    () => new Map([...catalogRows, ...rows].map((row) => [row.sku, row])),
    [rows, catalogRows],
  );
  const activeItems = activeSkus
    .map((sku) => rowsBySku.get(sku))
    .filter((item): item is InventoryItem => !!item);

  const categoryOptions = useMemo(
    () => Array.from(new Set(catalogRows.map((row) => row.categoryId))).sort(),
    [catalogRows],
  );

  const physicalInventoryRows = rows.length ? rows : catalogRows;

  const patchFilter = (key: keyof typeof filters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const openMovementFor = (skus: string[], mode: InventoryMovementMode) => {
    setActiveSkus(skus);
    setMovementMode(mode);
    setMovementOpen(true);
  };

  const exportRows = (type: 'csv' | 'report') => {
    const targetRows =
      selectedIds.length > 0
        ? rows.filter((row) => selectedIds.includes(row.sku))
        : rows;

    const header = 'SKU,Produit,Dispo,Reserve,Seuil,Valeur';
    const body = targetRows
      .map((row) =>
        [
          row.sku,
          row.nameFr,
          row.quantityAvailable,
          row.quantityReserved,
          row.reorderPoint,
          row.stockValue,
        ].join(','),
      )
      .join('\n');

    downloadFile(
      type === 'csv' ? [header, body].join('\n') : `Rapport de stock\n\n${header}\n${body}`,
      type === 'csv' ? 'inventory-stock.csv' : 'inventory-report.txt',
      'text/plain;charset=utf-8;',
    );
    setToast(type === 'csv' ? 'Export inventaire genere.' : 'Rapport de stock genere.');
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.default', minHeight: '100%' }}>
      <InventoryPageHeader
        totalVariants={stats.units || rows.length}
        movementDisabled={catalogRows.length === 0}
        onExportReport={() => exportRows('report')}
        onExportCsv={() => exportRows('csv')}
        onOpenPhysical={() => setPhysicalOpen(true)}
        onOpenMovement={() => openMovementFor([], 'receipt')}
      />

      <InventoryMetricsRow stats={stats} />

      <StockFilters
        search={filters.search}
        categoryId={filters.categoryId}
        categoryOptions={categoryOptions}
        stockStatus={filters.stockStatus}
        sort={filters.sort}
        onSearchChange={(value) => patchFilter('search', value)}
        onCategoryChange={(value) => patchFilter('categoryId', value)}
        onStockStatusChange={(value) => patchFilter('stockStatus', value)}
        onSortChange={(value) => patchFilter('sort', value)}
        onReset={() =>
          setFilters({ search: '', categoryId: '', sort: 'stock-desc', stockStatus: '' })
        }
      />

      <StockTable
        rows={rows}
        loading={listQuery.isLoading}
        selectedIds={selectedIds}
        onToggleSelection={(sku) =>
          setSelectedIds((current) =>
            current.includes(sku)
              ? current.filter((value) => value !== sku)
              : [...current, sku],
          )
        }
        onToggleAll={() =>
          setSelectedIds((current) =>
            current.length === rows.length ? [] : rows.map((row) => row.sku),
          )
        }
        onView={(sku) => router.push(`/${locale}/inventory/${sku}`)}
        onAdjust={(sku) => openMovementFor([sku], 'receipt')}
        onMovement={(sku) => openMovementFor([sku], 'sale')}
        onHistory={(sku) => router.push(`/${locale}/inventory/${sku}?tab=movements`)}
      />

      {selectedIds.length > 0 ? (
        <InventorySelectionBar
          count={selectedIds.length}
          onGroupMovement={() => openMovementFor(selectedIds, 'receipt')}
        />
      ) : null}

      <StockMovementModal
        open={movementOpen}
        items={activeItems}
        catalog={catalogRows}
        initialMode={movementMode}
        onClose={() => setMovementOpen(false)}
        onSubmit={async (payload) => {
          try {
            await createMovement.mutateAsync(payload);
            setToast('Mouvement enregistré.');
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement.';
            setToast(message);
            throw err;
          }
        }}
      />

      <PhysicalInventoryModal
        open={physicalOpen}
        items={physicalInventoryRows}
        warehouseLabel="Entrepot Alger"
        onClose={() => setPhysicalOpen(false)}
        onApply={async (adjustments) => {
          for (const adjustment of adjustments) {
            await createMovement.mutateAsync({
              sku: adjustment.sku,
              type: 'physicalInventory',
              quantity: adjustment.counted,
              reason: 'Inventaire physique',
            });
          }
          setToast('Inventaire physique applique.');
        }}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2500}
        onClose={() => setToast('')}
        message={toast}
      />
    </Box>
  );
}

function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}
