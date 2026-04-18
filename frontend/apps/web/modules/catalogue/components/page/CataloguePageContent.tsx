'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import CatalogueActiveFilters from '@/modules/catalogue/components/page/CatalogueActiveFilters';
import CatalogueCategoryTab, {
  type CategoryNode,
} from '@/modules/catalogue/components/page/CatalogueCategoryTab';
import CatalogueMaskedAlert from '@/modules/catalogue/components/page/CatalogueMaskedAlert';
import CataloguePageHeader from '@/modules/catalogue/components/page/CataloguePageHeader';
import CatalogueTabsNav from '@/modules/catalogue/components/page/CatalogueTabsNav';
import CatalogueAuditDrawer from '@/modules/catalogue/components/list/CatalogueAuditDrawer';
import CatalogueAnalyticsDashboard from '@/modules/catalogue/components/list/CatalogueAnalyticsDashboard';
import CatalogueChannelsDashboard from '@/modules/catalogue/components/list/CatalogueChannelsDashboard';
import CatalogueFilters from '@/modules/catalogue/components/list/CatalogueFilters';
import CatalogueStatsBar from '@/modules/catalogue/components/list/CatalogueStatsBar';
import CatalogueTable from '@/modules/catalogue/components/list/CatalogueTable';
import BulkActionBar from '@/modules/catalogue/components/list/BulkActionBar';
import ExportModal from '@/modules/catalogue/components/modals/ExportModal';
import PlanificationGroupeeModal from '@/modules/catalogue/components/modals/PlanificationGroupeeModal';
import { getSearchHealthMeta } from '@/modules/catalogue/catalogue.ui';
import type { CatalogueStatus, CatalogueStockStatus } from '@/modules/catalogue/catalogue.types';
import { useCatalogue } from '@/modules/catalogue/hooks/useCatalogue';
import { useMaskProduct } from '@/modules/catalogue/hooks/useMaskProduct';
import { useOpenSearchStatus } from '@/modules/catalogue/hooks/useOpenSearchStatus';
import { usePublishProduct } from '@/modules/catalogue/hooks/usePublishProduct';
import { useReindexOpenSearch } from '@/modules/catalogue/hooks/useReindexOpenSearch';
import { useSchedulePublication } from '@/modules/catalogue/hooks/useSchedulePublication';
import { useUnpublishProduct } from '@/modules/catalogue/hooks/useUnpublishProduct';
import { useDeleteCatalogue } from '@/modules/catalogue/hooks/useDeleteCatalogue';
import { useCatalogueStats } from '@/modules/catalogue/hooks/useCatalogueStats';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory as useDeleteCategoryMutation,
  type Category,
} from '@/modules/catalogue/hooks/useCategoryMutations';
import CategoryModal from '@/modules/catalogue/components/modals/CategoryModal';

const INITIAL_PARAMS = {
  page: '1',
  pageSize: '20',
  search: '',
  status: '',
  category: '',
  stockStatus: '',
  channel: '',
  minPrice: '',
  maxPrice: '',
  sortBy: 'updatedAt',
  sortOrder: 'desc' as 'asc' | 'desc',
};

export default function CataloguePage() {
  const params = useParams();
  const router = useRouter();
  const locale = typeof params.locale === 'string' ? params.locale : 'fr';
  const [queryParams, setQueryParams] = useState(INITIAL_PARAMS);
  const [activeTab, setActiveTab] = useState(0);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState(false);
  const [categorySeoDrafts, setCategorySeoDrafts] = useState<
    Record<string, { metaTitleAr: string; metaTitleFr: string; slug: string }>
  >({});

  const listQuery = useCatalogue({
    page: Number(queryParams.page),
    pageSize: Number(queryParams.pageSize),
    search: queryParams.search,
    status: queryParams.status as CatalogueStatus | '',
    category: queryParams.category,
    stockStatus: queryParams.stockStatus as CatalogueStockStatus | '',
    channel: queryParams.channel,
    minPrice: queryParams.minPrice,
    maxPrice: queryParams.maxPrice,
    sortBy: queryParams.sortBy,
    sortOrder: queryParams.sortOrder,
  });
  const statsQuery = useCatalogue({
    page: 1,
    pageSize: 100,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });
  const bffStats = useCatalogueStats();
  const openSearchStatus = useOpenSearchStatus();
  const reindexMutation = useReindexOpenSearch();
  const maskMutation = useMaskProduct();
  const publishMutation = usePublishProduct();
  const unpublishMutation = useUnpublishProduct();
  const scheduleMutation = useSchedulePublication();
  const deleteMutation = useDeleteCatalogue();
  const categoriesQuery = useCategories();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategoryMutation();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const rows = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta ?? {
    total: rows.length,
    page: Number(queryParams.page),
    pageSize: Number(queryParams.pageSize),
  };
  const statsRows = statsQuery.data?.data ?? rows;
  const searchHealth = getSearchHealthMeta(openSearchStatus.data?.data.health ?? 'green');

  const bffStatsData = bffStats.data?.data;
  const stats = useMemo(
    () => ({
      total: bffStatsData?.total ?? statsRows.length,
      indexed: bffStatsData?.indexed ?? statsRows.filter((row) => row.openSearchIndexed).length,
      masked: bffStatsData?.masked ?? statsRows.filter((row) => row.status === 'masked').length,
      published: bffStatsData?.published ?? statsRows.filter((row) => row.status === 'published').length,
      scheduled: bffStatsData?.scheduled ?? statsRows.filter((row) => row.status === 'scheduled').length,
      singleChannel: statsRows.filter((row) => row.channelCount === 1).length,
      draft: bffStatsData?.pendingPublication ?? statsRows.filter((row) => row.status === 'draft').length,
    }),
    [bffStatsData, statsRows],
  );
  const statusCounts = useMemo(
    () => ({
      draft: statsRows.filter((row) => row.status === 'draft').length,
      masked: statsRows.filter((row) => row.status === 'masked').length,
      partial: statsRows.filter((row) => row.status === 'partial').length,
      published: statsRows.filter((row) => row.status === 'published').length,
      scheduled: statsRows.filter((row) => row.status === 'scheduled').length,
    }),
    [statsRows],
  );

  const categoryOptions = useMemo(
    () => Array.from(new Set(statsRows.map((row) => row.categoryId))).sort(),
    [statsRows],
  );
  const categoryTree = useMemo<CategoryNode[]>(() => {
    const groups = new Map<string, CategoryNode>();

    statsRows.forEach((row) => {
      const parts = row.categoryPath.split('>').map((part) => part.trim());
      const root = parts[0] || row.categoryId;
      const child = parts[1];
      const node = groups.get(root) ?? { name: root, count: 0, children: [] };
      node.count += 1;

      if (child) {
        const existing = node.children.find((item) => item.name === child);
        if (existing) existing.count += 1;
        else node.children.push({ name: child, count: 1 });
      }

      groups.set(root, node);
    });

    return Array.from(groups.values()).sort((left, right) => right.count - left.count);
  }, [statsRows]);
  const filteredCategoryTree = useMemo(() => {
    if (!categorySearch.trim()) {
      return categoryTree;
    }

    const query = categorySearch.toLowerCase();
    return categoryTree.filter(
      (node) =>
        node.name.toLowerCase().includes(query) ||
        node.children.some((child) => child.name.toLowerCase().includes(query)),
    );
  }, [categorySearch, categoryTree]);
  const selectedCategoryRows = useMemo(
    () =>
      statsRows.filter((row) =>
        selectedCategory
          ? row.categoryPath.toLowerCase().includes(selectedCategory.toLowerCase()) ||
            row.categoryId.toLowerCase() === selectedCategory.toLowerCase()
          : false,
      ),
    [selectedCategory, statsRows],
  );
  const categorySeoDraft = categorySeoDrafts[selectedCategory] ?? {
    metaTitleFr: `${selectedCategory || 'Catalogue'} | FERZA`,
    metaTitleAr: selectedCategoryRows[0]?.seo?.metaTitleAr ?? '',
    slug: `/categories/${(selectedCategory || 'catalogue').toLowerCase().replace(/\s+/g, '-')}`,
  };
  const auditItems = useMemo(
    () =>
      statsRows
        .flatMap((row) =>
          row.history.map((item) => ({
            ...item,
            subtitle: `${row.nameFr} - ${item.subtitle}`,
          })),
        )
        .sort((left, right) => new Date(right.at).getTime() - new Date(left.at).getTime())
        .slice(0, 10),
    [statsRows],
  );

  useEffect(() => {
    if (!selectedCategory && categoryTree.length > 0) {
      setSelectedCategory(categoryTree[0].children[0]?.name ?? categoryTree[0].name);
    }
  }, [categoryTree, selectedCategory]);

  useEffect(() => {
    setSelectedIds([]);
  }, [
    queryParams.category,
    queryParams.channel,
    queryParams.maxPrice,
    queryParams.minPrice,
    queryParams.page,
    queryParams.pageSize,
    queryParams.search,
    queryParams.sortBy,
    queryParams.sortOrder,
    queryParams.status,
    queryParams.stockStatus,
  ]);

  const selectedRows = rows.filter((row) => selectedIds.includes(row.id));
  const activeFilterChips = Object.entries(queryParams).filter(
    ([key, value]) =>
      !['page', 'pageSize', 'sortBy', 'sortOrder'].includes(key) && value !== '',
  );

  const patchParams = (patch: Record<string, string>) =>
    setQueryParams((current) => ({
      ...current,
      ...patch,
    }));

  const runBulk = async (
    handler: (id: string) => Promise<unknown>,
    ids: string[],
    successMessage: string,
  ) => {
    if (ids.length === 0) return;
    await Promise.all(ids.map((id) => handler(id)));
    setSelectedIds([]);
    setToast(successMessage);
  };

  const exportRows = ({
    format,
    languages,
    scope,
  }: {
    format: string;
    languages: string[];
    scope: string;
  }) => {
    const scopedRows =
      scope === 'selection'
        ? selectedRows
        : scope === 'published'
          ? statsRows.filter((row) => row.status === 'published')
          : scope === 'masked'
            ? statsRows.filter((row) => row.status === 'masked')
            : statsRows;

    const separator = format === 'csv' ? ',' : ';';
    const header = [
      'SKU',
      ...(languages.includes('fr') ? ['Nom FR'] : []),
      ...(languages.includes('ar') ? ['Nom AR'] : []),
      'Categorie',
      'Prix TTC',
      'Statut',
      'Canaux',
    ];
    const content = [
      header.join(separator),
      ...scopedRows.map((row) =>
        [
          row.sku,
          ...(languages.includes('fr') ? [row.nameFr] : []),
          ...(languages.includes('ar') ? [row.nameAr] : []),
          row.categoryPath,
          row.priceTTC,
          row.status,
          row.channels.join('|'),
        ].join(separator),
      ),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `catalogue-export.${format === 'pdf' ? 'txt' : format}`;
    link.click();
    URL.revokeObjectURL(link.href);
    setToast('Export genere.');
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.default', minHeight: '100%' }}>
      <CataloguePageHeader
        onOpenAudit={() => setAuditOpen(true)}
      />

      <CatalogueMaskedAlert
        maskedCount={stats.masked}
        onViewProducts={() => {
          setActiveTab(0);
          patchParams({ page: '1', status: 'masked' });
        }}
      />

      <CatalogueStatsBar stats={stats} subtitle={`${searchHealth.label} 48ms`} />

      <CatalogueTabsNav activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 0 && (
        <>
          <CatalogueFilters
            advancedOpen={advancedOpen}
            categoryOptions={categoryOptions}
            currentParams={queryParams}
            statusCounts={statusCounts}
            totalCount={stats.total}
            onExportClick={() => setExportOpen(true)}
            onParamsChange={patchParams}
            onRefresh={async () => {
              await Promise.all([listQuery.refetch(), statsQuery.refetch(), bffStats.refetch(), openSearchStatus.refetch()]);
              setToast('Donnees actualisees.');
            }}
            onReset={() => setQueryParams(INITIAL_PARAMS)}
            onToggleAdvanced={() => setAdvancedOpen((current) => !current)}
          />

          <CatalogueActiveFilters
            filters={activeFilterChips}
            onRemove={(key) => patchParams({ [key]: '', page: '1' })}
          />

          <CatalogueTable
            currentParams={queryParams}
            rows={rows}
            loading={listQuery.isLoading}
            page={meta.page ?? 1}
            pageSize={meta.pageSize ?? 20}
            selectedIds={selectedIds}
            totalCount={meta.total ?? 0}
            onPageChange={(nextPage) => patchParams({ page: String(nextPage) })}
            onPageSizeChange={(nextPageSize) => patchParams({ page: '1', pageSize: String(nextPageSize) })}
            onParamsChange={patchParams}
            onToggleSelection={(id) =>
              setSelectedIds((current) =>
                current.includes(id)
                  ? current.filter((value) => value !== id)
                  : [...current, id],
              )
            }
            onToggleAll={() =>
              setSelectedIds((current) => (current.length === rows.length ? [] : rows.map((row) => row.id)))
            }
            onView={(id) => router.push(`/${locale}/catalogue/${id}?mode=view`)}
            onEdit={(id) => router.push(`/${locale}/catalogue/${id}`)}
            onDelete={(id) => setDeleteConfirmId(id)}
            onPublish={(id) =>
              runBulk((entryId) => publishMutation.mutateAsync(entryId), [id], 'Produit publie.')
            }
            onUnpublish={(id) =>
              runBulk((entryId) => unpublishMutation.mutateAsync(entryId), [id], 'Produit de-publie.')
            }
            onSchedule={(id) => {
              setSelectedIds([id]);
              setScheduleOpen(true);
            }}
          />
        </>
      )}

      {activeTab === 1 && (
        <CatalogueCategoryTab
          categorySearch={categorySearch}
          categorySeoDraft={categorySeoDraft}
          filteredCategoryTree={filteredCategoryTree}
          selectedCategory={selectedCategory}
          selectedCategoryRows={selectedCategoryRows}
          onAddCategory={() => {
            setEditingCategory(null);
            setCategoryModalOpen(true);
          }}
          onCategorySearchChange={setCategorySearch}
          onCategorySeoDraftChange={(patch) =>
            setCategorySeoDrafts((current) => ({
              ...current,
              [selectedCategory]: {
                ...categorySeoDraft,
                ...patch,
              },
            }))
          }
          onDeleteCategory={() => setDeleteCategoryConfirm(true)}
          onEditCategory={() => {
            const cats = categoriesQuery.data?.data ?? [];
            const match = cats.find((c) => c.nameFr === selectedCategory);
            setEditingCategory(match ?? null);
            setCategoryModalOpen(true);
          }}
          onOpenProduct={(id) => router.push(`/${locale}/catalogue/${id}`)}
          onSelectCategory={setSelectedCategory}
        />
      )}

      {activeTab === 2 && (
        <CatalogueChannelsDashboard
          rows={statsRows}
          openSearchStatus={openSearchStatus.data?.data}
          reindexPending={reindexMutation.isPending}
          onNotify={setToast}
          onReindex={async () => {
            await reindexMutation.mutateAsync();
            setToast('OpenSearch re-indexe.');
          }}
        />
      )}

      {activeTab === 3 && (
        <CatalogueAnalyticsDashboard
          rows={statsRows}
          reindexPending={reindexMutation.isPending}
          onCreateProduct={() => router.push(`/${locale}/pim`)}
          onDiagnose={(id) => router.push(`/${locale}/catalogue/${id}`)}
          onOpenPim={(productId) => router.push(`/${locale}/pim/${productId}`)}
          onReindex={async () => {
            await reindexMutation.mutateAsync();
            setToast('OpenSearch re-indexe.');
          }}
        />
      )}

      <BulkActionBar
        count={selectedIds.length}
        onPublish={() => runBulk((id) => publishMutation.mutateAsync(id), selectedIds, 'Selection publiee.')}
        onMask={() => runBulk((id) => maskMutation.mutateAsync(id), selectedIds, 'Selection masquee.')}
        onSchedule={() => setScheduleOpen(true)}
        onExport={() => setExportOpen(true)}
        onClear={() => setSelectedIds([])}
      />

      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        maskedCount={stats.masked}
        publishedCount={stats.published}
        selectedCount={selectedIds.length}
        totalCount={stats.total}
        onConfirm={(options) => {
          exportRows(options);
          setExportOpen(false);
        }}
      />

      <PlanificationGroupeeModal
        open={scheduleOpen}
        count={selectedIds.length}
        onClose={() => setScheduleOpen(false)}
        onConfirm={async (scheduledAt) => {
          await Promise.all(selectedIds.map((id) => scheduleMutation.mutateAsync({ id, scheduledAt })));
          setScheduleOpen(false);
          setToast('Planification enregistree.');
          setSelectedIds([]);
        }}
      />

      <CatalogueAuditDrawer open={auditOpen} onClose={() => setAuditOpen(false)} items={auditItems} />

      <Dialog open={Boolean(deleteConfirmId)} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Etes-vous sur de vouloir supprimer ce catalogue ? Cette action est irreversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>Annuler</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (deleteConfirmId) {
                await deleteMutation.mutateAsync(deleteConfirmId);
                setDeleteConfirmId(null);
                setToast('Catalogue supprime avec succes.');
              }
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteCategoryConfirm} onClose={() => setDeleteCategoryConfirm(false)}>
        <DialogTitle>Supprimer la categorie</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Etes-vous sur de vouloir supprimer la categorie &quot;{selectedCategory}&quot; ?
            Les {selectedCategoryRows.length} produits associes seront reclasses.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCategoryConfirm(false)}>Annuler</Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteCategoryMutation.isPending}
            onClick={async () => {
              const cats = categoriesQuery.data?.data ?? [];
              const match = cats.find((c) => c.nameFr === selectedCategory);
              if (match) {
                await deleteCategoryMutation.mutateAsync(match.id);
              }
              setDeleteCategoryConfirm(false);
              setToast(`Categorie "${selectedCategory}" supprimee.`);
              setSelectedCategory('');
            }}
          >
            {deleteCategoryMutation.isPending ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>

      <CategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categories={categoriesQuery.data?.data ?? []}
        initialData={editingCategory}
        isPending={createCategoryMutation.isPending || updateCategoryMutation.isPending}
        onSubmit={async (data) => {
          if (editingCategory) {
            await updateCategoryMutation.mutateAsync({ id: editingCategory.id, ...data });
            setToast(`Categorie "${data.nameFr}" mise a jour.`);
          } else {
            await createCategoryMutation.mutateAsync(data);
            setToast(`Categorie "${data.nameFr}" ajoutee.`);
          }
          setCategoryModalOpen(false);
        }}
      />

      <Snackbar open={Boolean(toast)} autoHideDuration={2500} onClose={() => setToast('')} message={toast} />
    </Box>
  );
}
