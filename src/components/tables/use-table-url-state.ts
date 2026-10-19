"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type {
  TableFilterDef,
  TableFilterValues,
  TablePaginationState,
  TableSortState,
} from "./table-types";
import {
  DEFAULT_PAGE_SIZE,
  parseTableUrlParams,
  resolveUpdater,
  serializeTableUrlParams,
} from "./table-utils";

export interface UseTableUrlStateOptions {
  filterDefs?: readonly TableFilterDef[];
  urlKeyPrefix?: string;
  defaultPageSize?: number;
  /** When false, state stays in memory only (no URL read/write). */
  enabled?: boolean;
}

export interface TableUrlState {
  pagination: TablePaginationState;
  search: string;
  sort: TableSortState | null;
  filters: TableFilterValues;
}

export interface TableUrlStateResult extends TableUrlState {
  setPagination: (updater: TablePaginationState | ((prev: TablePaginationState) => TablePaginationState)) => void;
  setSearch: (search: string) => void;
  setSort: (sort: TableSortState | null) => void;
  setFilters: (filters: TableFilterValues) => void;
}

type InternalState = TableUrlState;

/**
 * Owns table state and mirrors it into the URL when `enabled`. Initial state is read
 * lazily from `useSearchParams()` (no effect) to avoid a hydration mismatch, and the
 * URL is written with `router.replace(..., { scroll: false })`.
 *
 * Note: pages that render a descendant using `useSearchParams` need a Suspense
 * boundary (see `app/(main)/search/page.tsx`).
 */
export function useTableUrlState(options: UseTableUrlStateOptions = {}): TableUrlStateResult {
  const {
    filterDefs = [],
    urlKeyPrefix = "",
    defaultPageSize = DEFAULT_PAGE_SIZE,
    enabled = true,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramsString = searchParams ? searchParams.toString() : "";

  const [state, setState] = React.useState<InternalState>(() => {
    if (!enabled) {
      return { pagination: { pageIndex: 0, pageSize: defaultPageSize }, search: "", sort: null, filters: {} };
    }
    const parsed = parseTableUrlParams(new URLSearchParams(paramsString), filterDefs, { urlKeyPrefix });
    return {
      pagination: {
        pageIndex: Math.max(0, parsed.page - 1),
        pageSize: parsed.pageSize ?? defaultPageSize,
      },
      search: parsed.search ?? "",
      sort: parsed.sort ?? null,
      filters: parsed.filters ?? {},
    };
  });

  // Synchronous mirror so rapid same-tick updates compose without stale closures.
  const stateRef = React.useRef(state);
  stateRef.current = state;

  const pushUrl = React.useCallback(
    (next: InternalState) => {
      const params = new URLSearchParams(paramsString);
      for (const key of [`${urlKeyPrefix}page`, `${urlKeyPrefix}pageSize`, `${urlKeyPrefix}search`, `${urlKeyPrefix}sort`]) {
        params.delete(key);
      }
      for (const def of filterDefs) params.delete(`${urlKeyPrefix}f_${def.id}`);

      const serialized = serializeTableUrlParams(
        {
          page: next.pagination.pageIndex + 1,
          pageSize: next.pagination.pageSize,
          search: next.search,
          sort: next.sort,
          filters: next.filters,
        },
        filterDefs,
        { urlKeyPrefix },
      );
      for (const [key, value] of Object.entries(serialized)) params.set(key, value);

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [filterDefs, paramsString, pathname, router, urlKeyPrefix],
  );

  const applyState = React.useCallback(
    (patch: Partial<InternalState>) => {
      const next = { ...stateRef.current, ...patch };
      stateRef.current = next;
      setState(next);
      if (enabled) pushUrl(next);
    },
    [enabled, pushUrl],
  );

  const setPagination = React.useCallback<TableUrlStateResult["setPagination"]>(
    (updater) => {
      const nextPagination = resolveUpdater(updater, stateRef.current.pagination);
      applyState({ pagination: nextPagination });
    },
    [applyState],
  );

  const setSearch = React.useCallback(
    (search: string) => applyState({ search }),
    [applyState],
  );

  const setSort = React.useCallback(
    (sort: TableSortState | null) => applyState({ sort }),
    [applyState],
  );

  const setFilters = React.useCallback(
    (filters: TableFilterValues) => applyState({ filters }),
    [applyState],
  );

  return {
    pagination: state.pagination,
    search: state.search,
    sort: state.sort,
    filters: state.filters,
    setPagination,
    setSearch,
    setSort,
    setFilters,
  };
}
