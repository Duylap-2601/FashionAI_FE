import type { RowData } from "@tanstack/react-table";
import type {
  TableFilterDef,
  TableFilterValue,
  TableFilterValues,
  TableColumnAlign,
  TableColumnDef,
  TableColumnExtras,
  TableColumnFormat,
  TablePaginationState,
  TableSortState,
} from "./table-types";

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

type Updater<T> = T | ((old: T) => T);

export function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === "function" ? (updater as (old: T) => T)(previous) : updater;
}

/** Row numbering for the current page: 0-based pageIndex, 0-based position on page. */
export function computeStt(pageIndex: number, pageSize: number, positionOnPage: number): number {
  return pageIndex * pageSize + positionOnPage + 1;
}

/**
 * Normalizes search text: NFD-decompose, strip combining diacritics, lowercase, then
 * map đ→d (NFD does not decompose đ/Đ, so the mapping is explicit).
 * `"đầm"` → `"dam"`.
 */
export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d");
}

/** `query` must already be normalized via normalizeSearch; `text` may be raw. */
export function matchesSearch(text: string, query: string): boolean {
  if (!query) return true;
  return normalizeSearch(text).includes(query);
}

/** Reads a dot-separated path (e.g. `"address.city"`) from a row object. */
export function getByPath(row: unknown, path: string): unknown {
  if (!path.includes(".")) return (row as Record<string, unknown> | null)?.[path];
  let result: unknown = row;
  for (const key of path.split(".")) {
    if (result == null) return undefined;
    result = (result as Record<string, unknown>)[key];
  }
  return result;
}

/** A filter is inactive (skipped) when its value is null/empty. Boolean false IS active. */
export function isFilterActive(value: TableFilterValue): boolean {
  if (value == null) return false;
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.length > 0;
  if (typeof value === "object") return Boolean(value.from || value.to);
  return false;
}

export function hasActiveFilters(filters: TableFilterValues | undefined): boolean {
  if (!filters) return false;
  return Object.values(filters).some(isFilterActive);
}

export function hasActiveQuery(search: string | undefined, filters: TableFilterValues | undefined): boolean {
  return Boolean(search && search.trim()) || hasActiveFilters(filters);
}

function toComparable(value: unknown): string | null {
  if (value == null) return null;
  const str = String(value).trim();
  return str === "" ? null : str;
}

function matchesFilterValue(rowValue: unknown, filterValue: TableFilterValue): boolean {
  switch (typeof filterValue) {
    case "string": {
      const row = toComparable(rowValue);
      return row !== null && row === filterValue;
    }
    case "boolean": {
      const bool = rowValue == null || rowValue === "" ? false : Boolean(rowValue);
      return bool === filterValue;
    }
    default:
      break;
  }
  if (Array.isArray(filterValue)) {
    if (filterValue.length === 0) return true;
    const row = toComparable(rowValue);
    return row !== null && filterValue.includes(row);
  }
  if (filterValue && typeof filterValue === "object" && "from" in filterValue) {
    const { from, to } = filterValue;
    if (!from && !to) return true;
    const time = rowDateValue(rowValue);
    if (time === null) return false;
    if (from) {
      const fromTime = dayStart(from);
      if (fromTime !== null && time < fromTime) return false;
    }
    if (to) {
      const toTime = dayEnd(to);
      if (toTime !== null && time > toTime) return false;
    }
    return true;
  }
  return true;
}

function rowDateValue(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? null : parsed;
}

function dayStart(dateStr: string): number | null {
  const parsed = Date.parse(dateStr);
  if (Number.isNaN(parsed)) return null;
  const d = new Date(parsed);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function dayEnd(dateStr: string): number | null {
  const parsed = Date.parse(dateStr);
  if (Number.isNaN(parsed)) return null;
  const d = new Date(parsed);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

/**
 * Applies all active filters with AND across fields and OR within a multi-select field.
 * `getFilterValue` extracts a row's value for a given filter id.
 */
export function applyFilters<TData>(
  rows: readonly TData[],
  filters: TableFilterValues | undefined,
  getFilterValue: (row: TData, filterId: string) => unknown,
): TData[] {
  if (!filters) return [...rows];
  const active = Object.entries(filters).filter(([, value]) => isFilterActive(value));
  if (active.length === 0) return [...rows];
  return rows.filter((row) =>
    active.every(([id, filterValue]) => matchesFilterValue(getFilterValue(row, id), filterValue)),
  );
}

function columnAccessorKey(column: TableColumnDef<RowData>): string | undefined {
  return "accessorKey" in column && column.accessorKey != null ? String(column.accessorKey) : undefined;
}

function columnId(column: TableColumnDef<RowData>): string | null {
  if ("id" in column && column.id) return column.id;
  const accessorKey = columnAccessorKey(column);
  // Match TanStack's id resolution so the resolved id equals `cell.column.id`.
  return accessorKey ? accessorKey.replaceAll(".", "_") : null;
}

function splitSegments(key: string): string[] {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[\s_\-/]+/i)
    .map((s) => s.toLowerCase())
    .filter(Boolean);
}

const CODE_SEGMENTS = new Set(["code", "sku", "slug", "ref", "reference", "number", "no"]);

function isCodeLike(key: string): boolean {
  return splitSegments(key).some((segment) => CODE_SEGMENTS.has(segment));
}

function isIdLike(key: string): boolean {
  return splitSegments(key).some((segment) => segment === "id");
}

/**
 * Resolves which column should host whole-row detail navigation. Precedence:
 * explicit `enableDetailNavigation: true` > code-like accessor > id-like accessor > none.
 * Columns with `enableDetailNavigation: false` are excluded from the implicit passes.
 */
export function resolveDetailColumn<TData extends RowData>(
  columns: readonly TableColumnDef<TData>[],
): string | null {
  const all = columns as readonly TableColumnDef<RowData>[];

  const explicit = all.find((column) => (column as TableColumnExtras).enableDetailNavigation === true);
  if (explicit) return columnId(explicit);

  const candidates = all.filter((column) => (column as TableColumnExtras).enableDetailNavigation !== false);

  const codeLike = candidates.find((column) => {
    const key = columnAccessorKey(column);
    return key ? isCodeLike(key) : false;
  });
  if (codeLike) return columnId(codeLike);

  const idLike = candidates.find((column) => {
    const key = columnAccessorKey(column);
    return key ? isIdLike(key) : false;
  });
  if (idLike) return columnId(idLike);

  return null;
}

/** Clamps a 0-based pageIndex into the valid [0, pageCount-1] range (pageCount >= 1). */
export function clampPage(pageIndex: number, pageSize: number, total: number): number {
  if (pageSize <= 0) return 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return Math.min(Math.max(0, Math.floor(pageIndex)), pageCount - 1);
}

/** "Hiển thị X - Y trong Z bản ghi" (empty string when there are no rows). */
export function formatRange(
  pageIndex: number,
  pageSize: number,
  total: number,
  itemLabel = "bản ghi",
): string {
  if (total <= 0 || pageSize <= 0) return "";
  const start = pageIndex * pageSize + 1;
  const end = Math.min(total, (pageIndex + 1) * pageSize);
  return `Hiển thị ${start} - ${end} trong ${total} ${itemLabel}`;
}

/** TanStack SortingState (array) ↔ single TableSortState. */
export function toTableSortState(sorting: readonly { id: string; desc: boolean }[]): TableSortState | null {
  const first = sorting[0];
  if (!first) return null;
  return { id: first.id, dir: first.desc ? "desc" : "asc" };
}

export function toSortingState(sort: TableSortState | null | undefined): { id: string; desc: boolean }[] {
  if (!sort) return [];
  return [{ id: sort.id, desc: sort.dir === "desc" }];
}

export interface TableChangeHandlers {
  onPaginationChange: (updater: Updater<TablePaginationState>) => void;
  onSortingChange: (updater: Updater<TableSortState[]>) => void;
  onSearchChange: (search: string) => void;
  onFiltersChange: (updater: Updater<TableFilterValues>) => void;
  onPageSizeChange: (pageSize: number) => void;
}

/**
 * Builds state-change handlers that reset `pageIndex` to 0 whenever the result set
 * identity can change (search, filters, sort, pageSize). Kept as a pure factory so
 * the reset contract is testable without a DOM.
 */
export function createTableChangeHandlers(deps: {
  setPagination: (updater: Updater<TablePaginationState>) => void;
  setSorting: (updater: Updater<TableSortState[]>) => void;
  setSearch?: (search: string) => void;
  setFilters?: (updater: Updater<TableFilterValues>) => void;
}): TableChangeHandlers {
  const resetPage = () => deps.setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  return {
    onPaginationChange: (updater) => deps.setPagination(updater),
    onSortingChange: (updater) => {
      deps.setSorting(updater);
      resetPage();
    },
    onSearchChange: (search) => {
      deps.setSearch?.(search);
      resetPage();
    },
    onFiltersChange: (updater) => {
      deps.setFilters?.(updater);
      resetPage();
    },
    onPageSizeChange: (pageSize) => {
      deps.setPagination(() => ({ pageIndex: 0, pageSize }));
    },
  };
}

export interface TableUrlState {
  /** 1-based page, matching the URL contract. */
  page: number;
  pageSize?: number;
  search?: string;
  sort?: TableSortState | null;
  filters?: TableFilterValues;
}

export interface TableUrlCodecOptions {
  urlKeyPrefix?: string;
}

function parseFilterParam(def: TableFilterDef, raw: string): TableFilterValue {
  switch (def.type) {
    case "multi-select":
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    case "boolean":
      return raw === "true" ? true : raw === "false" ? false : null;
    case "date-range": {
      const [from = "", to = ""] = raw.split("..");
      return { from: from.trim(), to: to.trim() };
    }
    case "select":
    default:
      return raw;
  }
}

function serializeFilterParam(def: TableFilterDef, value: TableFilterValue | undefined): string {
  if (value == null) return "";
  switch (def.type) {
    case "multi-select":
      return Array.isArray(value) && value.length > 0 ? value.join(",") : "";
    case "boolean":
      return typeof value === "boolean" ? String(value) : "";
    case "date-range": {
      const from = typeof value === "object" && "from" in value ? value.from ?? "" : "";
      const to = typeof value === "object" && "to" in value ? value.to ?? "" : "";
      return from || to ? `${from}..${to}` : "";
    }
    case "select":
    default:
      return typeof value === "string" && value ? value : "";
  }
}

function parseSortParam(raw: string | null): TableSortState | null {
  if (!raw) return null;
  const [id, dir] = raw.split(":");
  if (!id) return null;
  return { id, dir: dir === "desc" ? "desc" : "asc" };
}

/**
 * Parses table state from URL search params. `page` is 1-based in the URL. Filters are
 * read from `f_<id>` keys typed by `filterDefs`.
 */
export function parseTableUrlParams(
  params: URLSearchParams,
  filterDefs: readonly TableFilterDef[] = [],
  options: TableUrlCodecOptions = {},
): TableUrlState {
  const prefix = options.urlKeyPrefix ?? "";
  const pageRaw = Number(params.get(`${prefix}page`));
  const pageSizeRaw = Number(params.get(`${prefix}pageSize`));
  const search = params.get(`${prefix}search`);
  const sort = parseSortParam(params.get(`${prefix}sort`));

  const filters: TableFilterValues = {};
  for (const def of filterDefs) {
    const raw = params.get(`${prefix}f_${def.id}`);
    if (raw == null || raw === "") continue;
    filters[def.id] = parseFilterParam(def, raw);
  }

  return {
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1,
    pageSize: Number.isFinite(pageSizeRaw) && pageSizeRaw > 0 ? Math.floor(pageSizeRaw) : undefined,
    search: search || undefined,
    sort,
    filters,
  };
}

/**
 * Serializes table state into URL params. Only non-default values are emitted so the
 * hook can keep the URL clean.
 */
export function serializeTableUrlParams(
  state: TableUrlState,
  filterDefs: readonly TableFilterDef[] = [],
  options: TableUrlCodecOptions = {},
): Record<string, string> {
  const prefix = options.urlKeyPrefix ?? "";
  const out: Record<string, string> = {};

  if (state.page && state.page > 1) out[`${prefix}page`] = String(state.page);
  if (state.pageSize && state.pageSize !== DEFAULT_PAGE_SIZE) out[`${prefix}pageSize`] = String(state.pageSize);
  if (state.search) out[`${prefix}search`] = state.search;
  if (state.sort) out[`${prefix}sort`] = `${state.sort.id}:${state.sort.dir}`;

  for (const def of filterDefs) {
    const encoded = serializeFilterParam(def, state.filters?.[def.id]);
    if (encoded) out[`${prefix}f_${def.id}`] = encoded;
  }

  return out;
}

/** Resolves a raw column def's id the same way TanStack does at construct time. */
export function rawColumnId(column: TableColumnDef<RowData>): string | null {
  return columnId(column);
}

/**
 * Collects the ids of columns that carry a caller-provided `cell` renderer. TanStack
 * installs a default `cell` on every column, so a plain `typeof cell === 'function'`
 * check cannot tell them apart — the caller's raw defs can.
 */
export function collectCustomCellColumnIds(columns: readonly unknown[]): Set<string> {
  const ids = new Set<string>();
  for (const entry of columns) {
    if (!entry || typeof entry !== "object") continue;
    const column = entry as TableColumnDef<RowData>;
    if (typeof (column as { cell?: unknown }).cell === "function") {
      const id = columnId(column);
      if (id) ids.add(id);
    }
  }
  return ids;
}

/** Default string rendering for auto (non-custom) cells, honoring `format`. */
export function formatCellValue(format: TableColumnFormat | undefined, value: unknown): string {
  if (value == null) return "";
  if (format === "date" || format === "datetime") {
    const date = value instanceof Date ? value : new Date(String(value));
    if (!Number.isNaN(date.getTime())) {
      return format === "datetime" ? date.toLocaleString("vi-VN") : date.toLocaleDateString("vi-VN");
    }
    return String(value);
  }
  if (format === "number" || format === "currency") {
    if (typeof value === "number") return value.toLocaleString("vi-VN");
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) return numeric.toLocaleString("vi-VN");
    return String(value);
  }
  return String(value);
}

/** `align` wins; otherwise numeric formats default to right alignment. */
export function resolveAlign(
  align: TableColumnAlign | undefined,
  format: TableColumnFormat | undefined,
): TableColumnAlign {
  if (align) return align;
  if (format === "number" || format === "currency") return "right";
  return "left";
}
