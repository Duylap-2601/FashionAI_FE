"use client";

import * as React from "react";
import type { RowData } from "@tanstack/react-table";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { TableColumnVisibility } from "./table-column-visibility";
import { TableFilters } from "./table-filters";
import type { TableFilterDef, TableFilterValues, TableInstance } from "./table-types";

export interface TableToolbarProps<TData extends RowData> {
  table: TableInstance<TData>;
  search: string;
  onSearchChange: (search: string) => void;
  filters?: readonly TableFilterDef[];
  filterValues?: TableFilterValues;
  onFiltersChange?: (values: TableFilterValues) => void;
  toolbarActions?: React.ReactNode;
  showColumnVisibility?: boolean;
  searchPlaceholder?: string;
  showSearch?: boolean;
}

/**
 * Search (debounced once, here only), filter area, caller-provided toolbar actions, and
 * the column-visibility menu.
 */
export function TableToolbar<TData extends RowData>({
  table,
  search,
  onSearchChange,
  filters,
  filterValues,
  onFiltersChange,
  toolbarActions,
  showColumnVisibility = true,
  searchPlaceholder = "Tìm kiếm...",
  showSearch = true,
}: TableToolbarProps<TData>) {
  const [localSearch, setLocalSearch] = React.useState(search);

  React.useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  React.useEffect(() => {
    if (localSearch === search) return;
    const timer = setTimeout(() => onSearchChange(localSearch), 300);
    return () => clearTimeout(timer);
  }, [localSearch, search, onSearchChange]);

  const clearSearch = () => {
    setLocalSearch("");
    onSearchChange("");
  };

  return (
    <div className="flex flex-wrap items-center gap-2" data-slot="table-toolbar">
      {showSearch ? (
        <div className="relative">
          <Search
            className="text-muted-foreground pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={localSearch}
            onChange={(event) => setLocalSearch(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Tìm kiếm"
            className="w-56 pr-8 pl-8"
            data-testid="table-search-input"
          />
          {localSearch ? (
            <button
              type="button"
              aria-label="Xóa tìm kiếm"
              className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2"
              onClick={clearSearch}
              data-testid="table-search-clear"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}

      {filters && filters.length > 0 && onFiltersChange ? (
        <TableFilters filters={filters} values={filterValues ?? {}} onChange={onFiltersChange} />
      ) : null}

      {toolbarActions || showColumnVisibility ? (
        <div className="ml-auto flex items-center gap-2">
          {toolbarActions}
          {showColumnVisibility ? <TableColumnVisibility table={table} /> : null}
        </div>
      ) : null}
    </div>
  );
}
