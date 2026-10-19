import type { CellData, RowData } from "@tanstack/react-table";
import type { CellContext, ColumnDef, HeaderContext, ReactTable, TableState } from "@tanstack/react-table";
import {
  columnVisibilityFeature,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
} from "@tanstack/react-table";

// One feature set is shared by both ClientTable and ServerTable. ServerTable simply
// turns on `manualSorting` / `manualPagination` / `manualFiltering`, which makes the
// TanStack row-model pipeline skip the registered row models and treat the incoming
// `data` as already sorted/filtered/paginated.
export const sharedTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  columnVisibilityFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
});

export type TableFeatureMap = typeof sharedTableFeatures;

/** Concrete table instance type produced by `useTable` with `sharedTableFeatures`. */
export type TableInstance<TData extends RowData = RowData> = ReactTable<
  TableFeatureMap,
  TData,
  TableState<TableFeatureMap>
>;

export type TableCellContext<TData extends RowData, TValue extends CellData = CellData> =
  CellContext<TableFeatureMap, TData, TValue>;

export type TableHeaderContext<TData extends RowData, TValue extends CellData = CellData> =
  HeaderContext<TableFeatureMap, TData, TValue>;

// A cell value format hint. Presentational only: BaseTable reads it to apply default
// alignment and truncation, but a custom `cell` renderer always wins.
export type TableColumnFormat = "date" | "datetime" | "number" | "currency" | "status";

export type TableColumnAlign = "left" | "center" | "right";

// TanStack ColumnDef plus the small set of presentation/search/sort hints this design
// system layers on top. Extra props are preserved on `column.columnDef` at runtime.
export interface TableColumnExtras {
  format?: TableColumnFormat;
  align?: TableColumnAlign;
  minWidth?: number | string;
  truncate?: boolean;
  // Marks this column as the candidate for whole-row detail navigation (a single
  // column wins by precedence; see resolveDetailColumn).
  enableDetailNavigation?: boolean;
  // Excludes this column's text from the toolbar search pipeline.
  enableSearching?: boolean;
}

export type TableColumnDef<
  TData extends RowData = RowData,
  TValue extends CellData = CellData,
> = ColumnDef<TableFeatureMap, TData, TValue> & TableColumnExtras;

export type TableSortDirection = "asc" | "desc";

// Single-column sort. `null` means the table is unsorted.
export interface TableSortState {
  id: string;
  dir: TableSortDirection;
}

// 0-based pagination state used internally. The URL contract uses a 1-based `page`
// (see use-table-url-state.ts).
export interface TablePaginationState {
  pageIndex: number;
  pageSize: number;
}

export type TableFilterType = "select" | "multi-select" | "boolean" | "date-range";

export interface TableFilterOption {
  label: string;
  value: string;
}

// A single filter field. Options and labels are always supplied by the caller so the
// shared components never hard-code business values (status, dates, etc.).
export interface TableFilterDef {
  id: string;
  label: string;
  type: TableFilterType;
  options?: TableFilterOption[];
}

// Resolved value for one filter field:
//   select          -> string | null
//   multi-select    -> string[] (empty array == inactive)
//   boolean         -> boolean | null
//   date-range      -> { from, to } (either side may be empty)
export type TableFilterValue =
  | string
  | string[]
  | boolean
  | { from: string; to: string }
  | null;

export type TableFilterValues = Record<string, TableFilterValue>;

export interface RowActionDef<TData extends RowData> {
  id: string;
  // Tooltip + accessible label for the icon button.
  label: string;
  icon: React.ReactNode;
  onClick: (row: TData) => void;
  hidden?: (row: TData) => boolean;
  disabled?: (row: TData) => boolean;
  // Destructive actions never run their own delete; the caller wires onClick to its
  // own confirm flow. `destructive` only controls button styling.
  destructive?: boolean;
}

export type TableEmptyVariant = "no-data" | "no-match";
