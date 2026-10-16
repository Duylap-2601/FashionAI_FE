"use client";

import * as React from "react";
import type { RowData } from "@tanstack/react-table";
import { useTable } from "@tanstack/react-table";

import { cn } from "@/components/ui/utils";
import { BaseTable } from "./base-table";
import { TablePagination } from "./table-pagination";
import { TableToolbar } from "./table-toolbar";
import type {
  RowActionDef,
  TableColumnDef,
  TableFeatureMap,
  TableFilterDef,
  TableFilterValues,
  TablePaginationState,
  TableSortState,
} from "./table-types";
import { sharedTableFeatures } from "./table-types";
import {
  DEFAULT_PAGE_SIZE,
  hasActiveQuery,
  resolveUpdater,
  toSortingState,
  toTableSortState,
} from "./table-utils";

export interface ServerTableProps<TData extends RowData> {
  /** One page of rows, already fetched/sorted/filtered/paginated by the server. */
  data: readonly TData[];
  columns: readonly TableColumnDef<TData>[];
  /** Server-reported total AFTER search/filter (drives pagination text + page count). */
  totalRows: number;
  pagination: TablePaginationState;
  onPaginationChange: (
    updater: TablePaginationState | ((prev: TablePaginationState) => TablePaginationState),
  ) => void;
  sorting?: TableSortState | null;
  onSortingChange?: (sort: TableSortState | null) => void;
  search?: string;
  onSearchChange?: (search: string) => void;
  filters?: readonly TableFilterDef[];
  filterValues?: TableFilterValues;
  onFiltersChange?: (filters: TableFilterValues) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  toolbarActions?: React.ReactNode;
  showColumnVisibility?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: readonly number[];
  itemLabel?: string;
  showPagination?: boolean;
  showIndex?: boolean;
  stickyIndex?: boolean;
  stickyActions?: boolean;
  maxHeight?: string | number;
  actions?: readonly RowActionDef<TData>[];
  getDetailUrl?: (row: TData) => string | null;
  onRowClick?: (row: TData) => void;
  className?: string;
}

/**
 * Table driven by server-fetched data. The component is fully controlled (props +
 * handlers); it never fetches and never guesses `totalRows` from `data.length`. Search,
 * sorting, and pagination run in manual mode (no TanStack row model), and every
 * search/filter/sort/pageSize change also emits `pageIndex: 0`.
 *
 * "server-*" means the data is server-fetched — the component itself is a client
 * component and must not be used in a route handler.
 */
export function ServerTable<TData extends RowData>({
  data,
  columns,
  totalRows,
  pagination,
  onPaginationChange,
  sorting = null,
  onSortingChange,
  search = "",
  onSearchChange,
  filters,
  filterValues,
  onFiltersChange,
  loading = false,
  error = null,
  onRetry,
  searchPlaceholder,
  showSearch = true,
  toolbarActions,
  showColumnVisibility = true,
  defaultPageSize = DEFAULT_PAGE_SIZE,
  pageSizeOptions,
  itemLabel,
  showPagination = true,
  showIndex = true,
  stickyIndex = false,
  stickyActions = false,
  maxHeight,
  actions,
  getDetailUrl,
  onRowClick,
  className,
}: ServerTableProps<TData>) {
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({});

  const table = useTable<TableFeatureMap, TData>({
    features: sharedTableFeatures,
    columns,
    data,
    state: {
      pagination,
      sorting: toSortingState(sorting),
      columnVisibility,
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.max(1, Math.ceil(totalRows / (pagination.pageSize || defaultPageSize))),
    rowCount: totalRows,
    onPaginationChange: (updater) => onPaginationChange(updater),
    onSortingChange: (updater) => {
      const nextSorting = resolveUpdater(updater, toSortingState(sorting));
      onSortingChange?.(toTableSortState(nextSorting));
      onPaginationChange((prev) => ({ ...prev, pageIndex: 0 }));
    },
    onColumnVisibilityChange: (updater) =>
      setColumnVisibility((prev) => resolveUpdater(updater, prev)),
    autoResetPageIndex: false,
    enableMultiSort: false,
    sortDescFirst: false,
  });

  const handleSearchChange = React.useCallback(
    (nextSearch: string) => {
      onSearchChange?.(nextSearch);
      onPaginationChange((prev) => ({ ...prev, pageIndex: 0 }));
    },
    [onPaginationChange, onSearchChange],
  );

  const handleFiltersChange = React.useCallback(
    (nextFilters: TableFilterValues) => {
      onFiltersChange?.(nextFilters);
      onPaginationChange((prev) => ({ ...prev, pageIndex: 0 }));
    },
    [onFiltersChange, onPaginationChange],
  );

  const clearAllFilters = React.useCallback(() => {
    handleSearchChange("");
    handleFiltersChange({});
  }, [handleFiltersChange, handleSearchChange]);

  const emptyVariant = hasActiveQuery(search, filterValues) ? "no-match" : "no-data";

  return (
    <div className={cn("flex flex-col gap-3", className)} data-slot="server-table">
      <TableToolbar
        table={table}
        search={search}
        onSearchChange={handleSearchChange}
        filters={filters}
        filterValues={filterValues}
        onFiltersChange={filters && filters.length > 0 ? handleFiltersChange : undefined}
        toolbarActions={toolbarActions}
        showColumnVisibility={showColumnVisibility}
        searchPlaceholder={searchPlaceholder}
        showSearch={showSearch}
      />

      <BaseTable<TData>
        table={table}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize || defaultPageSize}
        showIndex={showIndex}
        stickyIndex={stickyIndex}
        stickyActions={stickyActions}
        maxHeight={maxHeight}
        actions={actions}
        getDetailUrl={getDetailUrl}
        onRowClick={onRowClick}
        loading={loading}
        error={error}
        onRetry={onRetry}
        emptyVariant={emptyVariant}
        onClearEmpty={clearAllFilters}
      />

      {showPagination ? (
        <TablePagination
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize || defaultPageSize}
          totalRows={totalRows}
          onPageChange={(pageIndex) => onPaginationChange((prev) => ({ ...prev, pageIndex }))}
          onPageSizeChange={(pageSize) => onPaginationChange(() => ({ pageIndex: 0, pageSize }))}
          itemLabel={itemLabel}
          pageSizeOptions={pageSizeOptions}
        />
      ) : null}
    </div>
  );
}
