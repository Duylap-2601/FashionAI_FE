'use client';

import { DEFAULT_ADMIN_PAGINATION } from '@/features/admin/constants/admin-dashboard-page';
import { useLatestRef } from '@/features/admin/hooks/use-latest-ref';
import { createAdminListController } from '@/features/admin/services/admin-list-controller';
import type {
  AdminListPanelProps,
  AdminListQuery,
  AdminListResult,
  AdminPagination,
  AdminPaginationProps,
} from '@/features/admin/types/admin-dashboard-page';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseAdminListPanelPropsOptions<TFilters> {
  pagination: AdminPagination;
  isFetching: boolean;
  filters: TFilters;
  changePage: (page: number) => void;
  changePageSize: (size: number) => void;
  patchFilters: (patch: Partial<TFilters>) => void;
  resetFilters: () => void;
}

/** Dựng sẵn props phân trang/bộ lọc cho panel để trang chỉ cần spread `{...list.panelProps}`. */
export function useAdminListPanelProps<TFilters>({
  pagination,
  isFetching,
  filters,
  changePage,
  changePageSize,
  patchFilters,
  resetFilters,
}: UseAdminListPanelPropsOptions<TFilters>) {
  const paginationProps = useMemo<AdminPaginationProps>(() => ({
    currentPage: pagination.page,
    totalPages: pagination.totalPages,
    totalItems: pagination.total,
    pageSize: pagination.pageSize,
    onPageChange: changePage,
    onPageSizeChange: changePageSize,
    isFetching,
  }), [pagination, isFetching, changePage, changePageSize]);

  const panelProps = useMemo<AdminListPanelProps<TFilters>>(() => ({
    ...paginationProps,
    filters,
    onFilterChange: patchFilters,
    onResetFilters: resetFilters,
  }), [paginationProps, filters, patchFilters, resetFilters]);

  return { paginationProps, panelProps };
}

interface UseAdminPaginatedListOptions<TItem, TFilters> {
  initialFilters: TFilters;
  load: (query: AdminListQuery<TFilters>, signal: AbortSignal) => Promise<AdminListResult<TItem>>;
  onError: (error: unknown) => void;
  /** false khi tab đang ẩn: đổi trang/bộ lọc chỉ ghi nhận query, lần fetch kế tiếp sẽ dùng nó. */
  enabled?: boolean;
}

/**
 * State + phân trang + bộ lọc của một list admin, bọc createAdminListController.
 * Mọi callback trả về đều có identity ổn định.
 */
export function useAdminPaginatedList<TItem, TFilters extends object>({
  initialFilters,
  load,
  onError,
  enabled = true,
}: UseAdminPaginatedListOptions<TItem, TFilters>) {
  const [items, setItems] = useState<TItem[]>([]);
  const [filters, setFilters] = useState<TFilters>(initialFilters);
  const [pagination, setPagination] = useState<AdminPagination>(DEFAULT_ADMIN_PAGINATION);
  const [isFetching, setIsFetching] = useState(false);
  const initialFiltersRef = useRef(initialFilters);
  const optionsRef = useLatestRef({ load, onError, enabled });

  const [controller] = useState(() => createAdminListController<TItem, TFilters>({
    initialQuery: {
      page: DEFAULT_ADMIN_PAGINATION.page,
      pageSize: DEFAULT_ADMIN_PAGINATION.pageSize,
      filters: initialFilters,
    },
    load: (query, signal) => optionsRef.current.load(query, signal),
    isEnabled: () => optionsRef.current.enabled,
    onQueryChange: (query) => {
      setFilters(query.filters);
      setPagination(prev => ({ ...prev, page: query.page, pageSize: query.pageSize }));
    },
    onFetchingChange: setIsFetching,
    onResult: (result, query) => {
      setItems(result.items);
      setPagination({ page: query.page, pageSize: query.pageSize, total: result.total, totalPages: result.totalPages });
    },
    onError: (error) => optionsRef.current.onError(error),
  }));

  useEffect(() => () => controller.abort(), [controller]);

  const { fetch: fetchList, changePage, changePageSize } = controller;

  const changeFilters = useCallback((action: React.SetStateAction<TFilters>) => {
    const next = typeof action === 'function'
      ? (action as (prev: TFilters) => TFilters)(controller.getQuery().filters)
      : action;
    controller.changeFilters(next);
  }, [controller]);

  const patchFilters = useCallback((patch: Partial<TFilters>) => {
    changeFilters(prev => ({ ...prev, ...patch }));
  }, [changeFilters]);

  const resetFilters = useCallback(() => changeFilters(initialFiltersRef.current), [changeFilters]);

  const { paginationProps, panelProps } = useAdminListPanelProps({
    pagination,
    isFetching,
    filters,
    changePage,
    changePageSize,
    patchFilters,
    resetFilters,
  });

  return {
    items,
    setItems,
    filters,
    fetchList,
    changeFilters,
    paginationProps,
    panelProps,
  };
}
