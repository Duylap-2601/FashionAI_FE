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
  TableEmptyVariant,
  TableFeatureMap,
  TableFilterDef,
  TableFilterValues,
  TablePaginationState,
  TableSortState,
} from "./table-types";
import { sharedTableFeatures } from "./table-types";
import {
  DEFAULT_PAGE_SIZE,
  applyFilters,
  getByPath,
  normalizeSearch,
  resolveUpdater,
  toSortingState,
  toTableSortState,
} from "./table-utils";
import { useTableUrlState } from "./use-table-url-state";

export interface ClientTableProps<TData extends RowData> {
  data: readonly TData[];
  columns: readonly TableColumnDef<TData>[];
  searchPlaceholder?: string;
  showSearch?: boolean;
  filters?: readonly TableFilterDef[];
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
  syncUrl?: boolean;
  urlKeyPrefix?: string;
}

interface CoreProps<TData extends RowData> extends ClientTableProps<TData> {
  pagination: TablePaginationState;
  search: string;
  sort: TableSortState | null;
  activeFilters: TableFilterValues;
  setPagination: ClientTableSetPagination;
  setSearch: (search: string) => void;
  setSort: (sort: TableSortState | null) => void;
  setFilters: (filters: TableFilterValues) => void;
}

type ClientTableSetPagination = (
  updater: TablePaginationState | ((prev: TablePaginationState) => TablePaginationState),
) => void;

function stringifyValue(value: unknown): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(stringifyValue).join(" ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function ClientTableCore<TData extends RowData>({
  data,
  columns,
  searchPlaceholder,
  showSearch = true,
  filters,
  toolbarActions,
  showColumnVisibility = true,
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
  pagination,
  search,
  sort,
  activeFilters,
  setPagination,
  setSearch,
  setSort,
  setFilters,
}: CoreProps<TData>) {
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({});

  const searchAccessors = React.useMemo(() => {
    const accessors: ((row: TData) => unknown)[] = [];
    for (const column of columns) {
      const extras = column as { enableSearching?: boolean };
      if (extras.enableSearching === false) continue;
      if ("accessorFn" in column && typeof column.accessorFn === "function") {
        accessors.push((row) => column.accessorFn(row, 0));
      } else if ("accessorKey" in column && column.accessorKey != null) {
        const key = String(column.accessorKey);
        accessors.push((row) => getByPath(row, key));
      }
    }
    return accessors;
  }, [columns]);

  const searchQuery = React.useMemo(() => normalizeSearch(search.trim()), [search]);

  const filteredData = React.useMemo(() => {
    let rows = [...data];
    if (searchQuery) {
      rows = rows.filter((row) => {
        const haystack = searchAccessors
          .map((accessor) => normalizeSearch(stringifyValue(accessor(row))))
          .join(" ");
        return haystack.includes(searchQuery);
      });
    }
    if (activeFilters && Object.keys(activeFilters).length > 0) {
      rows = applyFilters(rows, activeFilters, (row, filterId) => getByPath(row, filterId));
    }
    return rows;
  }, [data, searchAccessors, searchQuery, activeFilters]);

  const table = useTable<TableFeatureMap, TData>({
    features: sharedTableFeatures,
    columns,
    data: filteredData,
    state: {
      pagination,
      sorting: toSortingState(sort),
      columnVisibility,
    },
    onPaginationChange: (updater) => setPagination(updater),
    onSortingChange: (updater) => {
      const nextSorting = resolveUpdater(updater, toSortingState(sort));
      setSort(toTableSortState(nextSorting));
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    onColumnVisibilityChange: (updater) =>
      setColumnVisibility((prev) => resolveUpdater(updater, prev)),
    autoResetPageIndex: false,
    enableMultiSort: false,
    sortDescFirst: false,
  });

  const handleSearchChange = React.useCallback(
    (nextSearch: string) => {
      setSearch(nextSearch);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    [setPagination, setSearch],
  );

  const handleFiltersChange = React.useCallback(
    (nextFilters: TableFilterValues) => {
      setFilters(nextFilters);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    [setFilters, setPagination],
  );

  const clearAllFilters = React.useCallback(() => {
    handleSearchChange("");
    handleFiltersChange({});
  }, [handleFiltersChange, handleSearchChange]);

  const emptyVariant: TableEmptyVariant = data.length === 0 ? "no-data" : "no-match";
  const totalRows = filteredData.length;

  return (
    <div className={cn("flex flex-col gap-3", className)} data-slot="client-table">
      <TableToolbar
        table={table}
        search={search}
        onSearchChange={handleSearchChange}
        filters={filters}
        filterValues={activeFilters}
        onFiltersChange={filters && filters.length > 0 ? handleFiltersChange : undefined}
        toolbarActions={toolbarActions}
        showColumnVisibility={showColumnVisibility}
        searchPlaceholder={searchPlaceholder}
        showSearch={showSearch}
      />

      <BaseTable<TData>
        table={table}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        showIndex={showIndex}
        stickyIndex={stickyIndex}
        stickyActions={stickyActions}
        maxHeight={maxHeight}
        actions={actions}
        getDetailUrl={getDetailUrl}
        onRowClick={onRowClick}
        emptyVariant={emptyVariant}
        onClearEmpty={clearAllFilters}
      />

      {showPagination ? (
        <TablePagination
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          totalRows={totalRows}
          onPageChange={(pageIndex) => setPagination((prev) => ({ ...prev, pageIndex }))}
          onPageSizeChange={(pageSize) => setPagination(() => ({ pageIndex: 0, pageSize }))}
          itemLabel={itemLabel}
          pageSizeOptions={pageSizeOptions}
        />
      ) : null}
    </div>
  );
}

function ClientTableLocal<TData extends RowData>(props: ClientTableProps<TData>) {
  const [pagination, setPagination] = React.useState<TablePaginationState>({
    pageIndex: 0,
    pageSize: props.defaultPageSize ?? DEFAULT_PAGE_SIZE,
  });
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<TableSortState | null>(null);
  const [filters, setFilters] = React.useState<TableFilterValues>({});

  return (
    <ClientTableCore<TData>
      {...props}
      pagination={pagination}
      search={search}
      sort={sort}
      activeFilters={filters}
      setPagination={setPagination}
      setSearch={setSearch}
      setSort={setSort}
      setFilters={setFilters}
    />
  );
}

function ClientTableUrl<TData extends RowData>(props: ClientTableProps<TData>) {
  const urlState = useTableUrlState({
    filterDefs: props.filters,
    urlKeyPrefix: props.urlKeyPrefix,
    defaultPageSize: props.defaultPageSize,
    enabled: true,
  });

  return (
    <ClientTableCore<TData>
      {...props}
      pagination={urlState.pagination}
      search={urlState.search}
      sort={urlState.sort}
      activeFilters={urlState.filters}
      setPagination={urlState.setPagination}
      setSearch={urlState.setSearch}
      setSort={urlState.setSort}
      setFilters={urlState.setFilters}
    />
  );
}

/**
 * In-memory table: search/filters run through a pure pipeline, sorting and pagination
 * through TanStack row models. Pass `syncUrl` to hydrate from and write state to the URL
 * (that path needs a Suspense boundary in the consuming page).
 */
export function ClientTable<TData extends RowData>(props: ClientTableProps<TData>) {
  return props.syncUrl ? <ClientTableUrl<TData> {...props} /> : <ClientTableLocal<TData> {...props} />;
}
