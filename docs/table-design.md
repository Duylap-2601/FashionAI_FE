# Table Design System (`src/components/tables/`)

This document is the single source of truth for the shared table components. Every
behavior described here matches the implementation in `src/components/tables/`.

The system provides two generic, typed entry points built on TanStack Table v9 and the
existing shadcn/Radix primitives in `src/components/ui/`:

- **`ClientTable<TData>`** — in-memory table. Search, filters, sorting, and pagination
  all run on the client over a dataset you pass in.
- **`ServerTable<TData>`** — table driven by server-fetched data. You pass one page of
  rows plus the server-reported total; the component never fetches and never guesses the
  total.

Both share the same presentation layer (`BaseTable`) and the same toolbar, filters,
pagination, actions, column-visibility, skeleton, empty, and error primitives. The only
difference is *where* search/filter/sort/pagination execute.

No screen has been migrated to these components yet; existing admin tables and
`admin-pagination.tsx` are untouched.

---

## 1. Overview and Goals

- One pair of generic TypeScript components (`ServerTable<TData>`, `ClientTable<TData>`)
  sharing `BaseTable` and every presentation primitive.
- No `any` in the public API. The only dependency added is `@tanstack/react-table` (v9).
- Optional features available today: column-visibility menu, sticky header, sticky
  STT/actions columns, custom toolbar actions, and URL state sync (page/search/sort/filters).
- Extension points documented but **not implemented**: row selection + bulk actions,
  multi-column sort, cursor pagination.

### Quick start

```tsx
"use client";

import { ClientTable, type TableColumnDef } from "@/components/tables/client-table";
import type { TableRow } from "@/features/products/types";

const columns: TableColumnDef<TableRow>[] = [
  { accessorKey: "code", header: "Mã", sortFn: "alphanumeric" },
  { accessorKey: "name", header: "Tên", sortFn: "alphanumeric", truncate: true },
  { accessorKey: "price", header: "Giá", sortFn: "basic", format: "number" },
  { accessorKey: "createdAt", header: "Ngày tạo", format: "datetime", enableSearching: false },
];

export function ProductTable({ rows }: { rows: TableRow[] }) {
  return (
    <ClientTable
      data={rows}
      columns={columns}
      getDetailUrl={(row) => `/products/${row.id}`}
      itemLabel="sản phẩm"
    />
  );
}
```

Server-side (controlled) example:

```tsx
"use client";

import { ServerTable, type TableColumnDef } from "@/components/tables/server-table";
import { useAdminProducts } from "@/features/admin/hooks/use-admin-products";

export function AdminProductsTable() {
  const { rows, total, pagination, search, sorting, filters, loading, error, retry, ...handlers } =
    useAdminProducts();

  return (
    <ServerTable
      data={rows}
      columns={columns}
      totalRows={total}
      pagination={pagination}
      onPaginationChange={handlers.setPagination}
      sorting={sorting}
      onSortingChange={handlers.setSorting}
      search={search}
      onSearchChange={handlers.setSearch}
      filterValues={filters}
      onFiltersChange={handlers.setFilters}
      loading={loading}
      error={error}
      onRetry={retry}
    />
  );
}
```

---

## 2. Component Architecture

```
ClientTable / ServerTable        state owner (internal or controlled)
        │
        ├── BaseTable            markup, flexRender cells, STT + actions columns,
        │                        aria-sort, sticky header/columns, loading/error/empty
        │     ├── TableSkeleton
        │     ├── TableEmptyState
        │     └── TableActions
        ├── TableToolbar         search (debounced once), filters, actions slot,
        │     │                  column-visibility menu
        │     ├── TableFilters
        │     └── TableColumnVisibility
        └── TablePagination      0-based, Vietnamese wording, page window
```

- `table-types.ts` — types plus the single shared TanStack feature set
  (`sharedTableFeatures`). Both tables use it; `ServerTable` turns on `manualSorting` /
  `manualPagination`, which makes the row-model pipeline skip the registered models.
- `table-utils.ts` — pure, framework-free logic (search normalization, filtering, STT,
  detail-column resolution, URL codec, change-handler factory). Fully unit-tested.
- `use-table-url-state.ts` — owns table state and mirrors it into the URL when enabled.
- `base-table.tsx`, `table-toolbar.tsx`, `table-filters.tsx`, `table-pagination.tsx`,
  `table-actions.tsx`, `table-column-visibility.tsx`, `table-skeleton.tsx`,
  `table-empty-state.tsx` — presentation.

There is deliberately **no barrel `index.ts`**; import from the specific file. Nothing in
`components/tables/` imports `http`/`fetch` or anything from `features/`.

---

## 3. State Ownership

- **`ServerTable` is fully controlled.** All state lives in the caller (props +
  handlers). The component never fetches and never derives `totalRows` from
  `data.length`; `totalRows` is whatever the server reports after search/filter.
- **`ClientTable` owns internal state** by default (plain `useState` for
  pagination/search/sort/filters plus column visibility).
- **URL sync** is opt-in via the `syncUrl` prop on `ClientTable`. When `syncUrl` is set,
  state is hydrated from and written back to the URL by `useTableUrlState`.
- For `ServerTable`, URL sync is a **caller composition** concern: the caller parses the
  URL (via `parseTableUrlParams`), passes the values as props, and calls the hook inside
  its own handlers. The component does not control the caller's state.

`ClientTable` splits into an internal local-state wrapper and a URL-sync wrapper so the
`next/navigation` hooks are only invoked on the `syncUrl` path (see Hydration).

---

## 4. Hydration and SSR

- Initial URL state is read **lazily inside the `useState` initializer** from
  `useSearchParams()`, not in an effect. This avoids a hydration mismatch and keeps
  `renderToStaticMarkup` tests deterministic.
- `useSearchParams()` may return `null` during prerendering; the hook guards for it and
  falls back to an empty `URLSearchParams`.
- **Pages that render a component using `useSearchParams` need a Suspense boundary.**
  Precedent: `src/app/(main)/search/page.tsx`. This applies to `ClientTable` with
  `syncUrl` and to any `ServerTable` page that syncs URL state through the hook.
- `ServerTable` and `ClientTable` (without `syncUrl`) do not touch `next/navigation`, so
  they do not require Suspense.

---

## 5. URL Parameters

| Concern    | URL key        | Encoding                                              | Internal mapping |
|-----------|----------------|-------------------------------------------------------|------------------|
| Page       | `page`         | 1-based integer                                       | `pagination.pageIndex` (0-based) |
| Page size  | `pageSize`     | integer (default 10 omitted)                          | `pagination.pageSize` |
| Search     | `search`       | raw string                                            | `search` |
| Sort       | `sort`         | `field:asc` / `field:desc`                            | `sort = { id, dir }` (single) |
| Select     | `f_<id>`       | single value                                          | `filters[id] = string` |
| Multi-select | `f_<id>`     | comma list `a,b`                                      | `filters[id] = string[]` |
| Boolean    | `f_<id>`       | `true` / `false`                                      | `filters[id] = boolean` |
| Date range | `f_<id>`       | `from..to` (either side may be empty)                 | `filters[id] = { from, to }` |

- All keys are optionally namespaced by `urlKeyPrefix` to avoid collisions with existing
  query keys (e.g. the search page's `q`). Pass `urlKeyPrefix="t_"` to get `t_page`,
  `t_search`, `t_f_<id>`, etc.
- Only non-default values are serialized, keeping URLs clean. Inactive filters are
  dropped.
- The codec lives in `table-utils.ts` (`parseTableUrlParams` / `serializeTableUrlParams`)
  and is pure + unit-tested. The page is 1-based in the URL and 0-based internally.

---

## 6. Search

- **Normalization** (`normalizeSearch`): NFD-decompose, strip combining diacritics, an
  explicit `đ → d` mapping (NFD does **not** decompose `đ`/`Đ`), then lowercase.
  `"đầm"` → `"dam"`, `"ĐÀ NẴNG"` → `"da nang"`.
- **Scope**: every column with an accessor, except columns that set
  `enableSearching: false`. Values are read via `accessorKey` (dot paths supported) or
  `accessorFn`, stringified, normalized, and matched as a substring.
- **Debounce**: 300 ms, applied **once** in `table-toolbar.tsx`. There is no second
  debounce anywhere else.
- A clear button (`aria-label="Xóa tìm kiếm"`) resets the query immediately.
- Changing the search resets the page to 0.
- In `ClientTable` the filter runs as a pure pipeline before the data reaches the table;
  in `ServerTable` the server performs it (the component just forwards the query).

---

## 7. Filters

- Filters are declared by the caller as `TableFilterDef[]` (`id`, `label`, `type`,
  `options`). **No business values (status lists, date formats) are hard-coded** in the
  shared components.
- Types: `select`, `multi-select`, `boolean`, `date-range`.
- Semantics: **AND across fields, OR within a multi-select field.** A row's `null` /
  empty / `undefined` value never matches an active filter.
- A filter is *inactive* (skipped) when its value is `null`, `""`, `[]`, or an empty
  date range. A `boolean` filter with value `false` **is** active.
- Active filters render as removable chips plus a **"Xóa bộ lọc"** button.
- Changing filters resets the page to 0.
- Filter values address row fields by path (the filter `id` is used as a dot-path into
  the row, same as a search accessor).

---

## 8. Sorting

- **Single column only** (`enableMultiSort: false`).
- Cycle: none → ascending → descending → none (`sortDescFirst: false` +
  `enableSortingRemoval`), i.e. `asc → desc → none` after the first click.
- Sortable headers are buttons; the `<th>` carries `aria-sort`
  (`ascending` / `descending` / `none`). A direction icon (ArrowUp / ArrowDown /
  ArrowUpDown) is shown.
- The STT column and the actions column are **never sortable** (they are injected outside
  the column system).
- Sorting keeps the current search/filters and resets the page to 0.
- `ClientTable` sorts through the TanStack sorted row model; `ServerTable` uses
  `manualSorting` and expects the server to return already-sorted rows.

---

## 9. Pagination

- Internal state is **0-based** (`{ pageIndex, pageSize }`). The URL is 1-based.
- Wording: `Hiển thị X - Y trong Z bản ghi` (`itemLabel` is configurable, e.g.
  `"sản phẩm"`). **Intentional difference from `AdminPagination`**, which says `mục` and
  uses page-size options `[10, 20, 50]`. These components default to
  `[10, 20, 50, 100]`.
- Prev/next buttons (`aria-label="Trang trước"` / `"Trang sau"`) plus a windowed page
  list with the current page marked `aria-current="page"`.
- The control is **hidden when there are 0 rows**, and stays safe when `total` is 0 or
  the page index is out of range (clamped).
- Changing the page size resets to page 0 with the new size; changing the page does not.
- `ClientTable` paginates through the TanStack paginated row model; `ServerTable` uses
  `manualPagination` + `rowCount`/`pageCount` from `totalRows`.

---

## 10. Row Numbers (STT)

- Computed as `pageIndex * pageSize + positionOnPage + 1`, where `positionOnPage` is the
  **rendered position of the row on the current page** (not TanStack's `row.index`, whose
  semantics differ after filtering/sorting).
- `ServerTable` assumes offset pagination; the server returns exactly one page.
- STT is rendered in a leading, non-focusable, non-sortable column and can be turned off
  with `showIndex={false}`. It can be made sticky with `stickyIndex`.
- Because STT and the actions column are injected outside the column system, they are
  never hidden by the column-visibility menu and never participate in search/sort.

---

## 11. Row Actions

- Icon-only buttons (`Button` ghost, size `icon`) using Lucide icons
  (`Eye` / `Pencil` / `Trash2` are the built-in suggestions).
- Each button has **both** a tooltip (`TooltipTrigger asChild`) and an `aria-label`.
- `RowActionDef<TData>` supports `hidden(row)` and `disabled(row)` predicates.
- Clicks call `event.stopPropagation()` so they do not also trigger a row click.
- **Destructive actions never delete anything themselves.** `destructive: true` only
  styles the button; the caller wires `onClick` to its own confirmation flow.
- The actions column can be made sticky with `stickyActions`.

---

## 12. Detail Links

- Provide `getDetailUrl(row) => string | null` on the table. A non-null URL turns the
  resolved detail column's cell into a `next/link` anchor (preserving Ctrl/Cmd+click and
  keyboard focus). A `null`/empty URL falls back to plain text.
- **Exactly one column** hosts the link, resolved by precedence
  (`resolveDetailColumn`):
  1. explicit `enableDetailNavigation: true`
  2. code-like accessor (`code`, `sku`, `slug`, `ref`, `number`, `no` as a word segment)
  3. id-like accessor (`…id`)
  4. otherwise no link
- `enableDetailNavigation: false` removes a column from the implicit passes.
- **A custom `cell` renderer always wins** — if the resolved detail column has a custom
  `cell`, that renderer is used and no link is wrapped (custom rendering takes
  precedence over linkification).
- The link stops click propagation so it does not also trigger a row click.

---

## 13. Table States (Loading / Empty / Error)

- **Loading** — `TableSkeleton` mirrors the current column structure (index + data +
  actions) so the layout does not jump when data arrives.
- **Empty vs no-match** — distinguished:
  - *no-data* (`Chưa có bản ghi nào`) when the dataset itself is empty.
  - *no-match* (`Không tìm thấy kết quả phù hợp`) when there are rows but the current
    search/filters exclude all of them; this variant shows a **"Xóa bộ lọc"** button.
  - `ClientTable` decides based on `data.length` vs filtered length; `ServerTable`
    decides based on `totalRows` plus whether a search/filter is active.
- **Error** — a message plus a **"Thử lại"** button that calls the caller's `onRetry`.
  Errors are never swallowed; the component does not fetch, so it only surfaces what the
  caller passes in.

---

## 14. Backend Mapping (Reference)

A typical server-driven list request and how it maps to component state:

```
GET /api/products?page=2&limit=10&search=ao&sort=price:desc&status=ACTIVE
→ data: Product[], __meta: { total, page, limit, totalPages }
```

- Request `page` (1-based) ↔ `pagination.pageIndex + 1`.
- Request `limit` ↔ `pagination.pageSize`.
- `search`, `sort=field:dir`, and filter query params are forwarded from component state.
- The response `__meta.total` (after search/filter) becomes `totalRows`.
- If an API uses a different envelope, write an adapter in the feature service; do not
  change these components.

---

## 15. Accessibility and Responsiveness

- **Semantic tables** (`<table>`/`<thead>`/`<tbody>`/`<th>`/`<td>`), reused from
  `ui/table.tsx`.
- `aria-sort` on sortable headers; `aria-current="page"` on the active page button.
- Icon buttons and pagination controls carry `aria-label`s.
- The detail link is a real anchor (focusable, Ctrl/Cmd+click works).
- STT column is not focusable and not navigable.
- Clear focus-visible styling is inherited from the `Button` primitive.
- **Responsiveness**: horizontal scroll is the primary strategy (the `ui/table.tsx`
  container already sets `overflow-x-auto`). The table is **not** transformed into a
  card layout.
- **Sticky header**: pass `maxHeight` (e.g. `"60vh"`). This makes the table container the
  scrollport and pins the header (`sticky top-0`). Without `maxHeight` the
  `overflow-x-auto` container would block sticky positioning. Sticky STT/actions columns
  are opt-in via `stickyIndex` / `stickyActions`.

---

## Dos and Don'ts

**Do**

- Use `ServerTable` when the server owns the data; use `ClientTable` for small,
  fully-loaded datasets.
- Keep business values (status options, date formats, currency) in the calling feature —
  pass them through `columns` and `filters`.
- Provide `getDetailUrl` and let the system resolve the single detail column, unless you
  have a reason to pin it with `enableDetailNavigation`.
- Wrap a page that uses URL-synced tables in a Suspense boundary.
- Set `itemLabel` so pagination wording reads naturally.
- Use `urlKeyPrefix` when the route already has query keys you must not clobber.

**Don't**

- Don't import anything from `features/` inside `components/tables/` (architecture rule).
- Don't add a second search debounce; it lives only in `table-toolbar.tsx`.
- Don't perform deletion inside a row action; delegate to the caller's confirm flow.
- Don't guess `totalRows` from `data.length` in `ServerTable`.
- Don't rely on `row.index` for STT; use the rendered page position.
- Don't transform the table into cards for mobile; use horizontal scroll.

## Acceptance Checklist (for new list screens)

- [ ] Correct component chosen (`ServerTable` vs `ClientTable`).
- [ ] Columns typed as `TableColumnDef<TData>`; no `any`.
- [ ] Search normalizes diacritics; `đ` handled; debounce not duplicated.
- [ ] Filters declared by the caller; AND/OR semantics verified.
- [ ] Sort is single-column with `asc → desc → none`; page resets on change.
- [ ] Pagination wording + page-size options correct; hidden at 0 rows.
- [ ] STT continues correctly across pages and after search/filter/sort.
- [ ] Row actions have tooltips + `aria-label`s; destructive ones delegate.
- [ ] Detail link resolves to exactly one column; custom cells still win.
- [ ] Loading / empty / no-match / error+Retry all render.
- [ ] `maxHeight` set if a sticky header is wanted.
- [ ] Page has a Suspense boundary if URL sync is used.
- [ ] `npm run lint`, `npm.cmd run typecheck`, `npm.cmd test`, and
      `npm.cmd run check:architecture` all pass.
