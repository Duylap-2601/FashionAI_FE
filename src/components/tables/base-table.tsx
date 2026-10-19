"use client";

import * as React from "react";
import type { Cell, Header, Row, RowData } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, CircleAlert, RefreshCw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/components/ui/utils";
import { TableActions } from "./table-actions";
import { TableEmptyState } from "./table-empty-state";
import { TableSkeleton } from "./table-skeleton";
import type {
  RowActionDef,
  TableEmptyVariant,
  TableFeatureMap,
  TableColumnAlign,
  TableColumnExtras,
  TableInstance,
} from "./table-types";
import {
  collectCustomCellColumnIds,
  computeStt,
  formatCellValue,
  resolveAlign,
  resolveDetailColumn,
} from "./table-utils";

const ALIGN_CLASS: Record<TableColumnAlign, string> = {
  left: "",
  center: "text-center",
  right: "text-right",
};

function minWidthStyle(minWidth: number | string | undefined): React.CSSProperties | undefined {
  if (minWidth == null) return undefined;
  return { minWidth: typeof minWidth === "number" ? `${minWidth}px` : minWidth };
}

export interface BaseTableProps<TData extends RowData> {
  table: TableInstance<TData>;
  /** 0-based page index of the rows currently rendered (used for STT). */
  pageIndex: number;
  pageSize: number;
  showIndex?: boolean;
  stickyIndex?: boolean;
  stickyActions?: boolean;
  /** Max height that turns the table container into the sticky-header scrollport. */
  maxHeight?: string | number;
  actions?: readonly RowActionDef<TData>[];
  getDetailUrl?: (row: TData) => string | null;
  onRowClick?: (row: TData) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyVariant?: TableEmptyVariant;
  onClearEmpty?: () => void;
  className?: string;
}

/**
 * Shared presentation layer for ServerTable and ClientTable: header/cell rendering via
 * flexRender, injected STT (leading) and actions (trailing) columns, sortable headers
 * with `aria-sort`, optional sticky header/columns, and loading/error/empty states.
 */
export function BaseTable<TData extends RowData>({
  table,
  pageIndex,
  pageSize,
  showIndex = true,
  stickyIndex = false,
  stickyActions = false,
  maxHeight,
  actions,
  getDetailUrl,
  onRowClick,
  loading = false,
  error = null,
  onRetry,
  emptyVariant = "no-data",
  onClearEmpty,
  className,
}: BaseTableProps<TData>) {
  const customCellIds = React.useMemo(
    () => collectCustomCellColumnIds(table.options.columns),
    [table],
  );

  const detailColumnId = React.useMemo(
    () => (getDetailUrl ? resolveDetailColumn(table.options.columns) : null),
    [table, getDetailUrl],
  );

  const showActions = Boolean(actions && actions.length > 0);
  const visibleColumnCount = table.getVisibleLeafColumns().length;

  if (error) {
    return (
      <div
        data-slot="table-error"
        className={cn("flex flex-col items-center justify-center gap-3 py-12 text-center", className)}
      >
        <CircleAlert className="text-destructive size-10" aria-hidden="true" />
        <p className="text-sm">{error}</p>
        {onRetry ? (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Thử lại
          </Button>
        ) : null}
      </div>
    );
  }

  if (loading) {
    return (
      <TableSkeleton
        className={className}
        columnCount={visibleColumnCount}
        rowCount={Math.min(pageSize || 5, 10)}
        showIndex={showIndex}
        showActions={showActions}
      />
    );
  }

  const containerStyle = maxHeight != null ? { maxHeight } : undefined;
  const stickyHeader = maxHeight != null;

  const totalColSpan = (showIndex ? 1 : 0) + visibleColumnCount + (showActions ? 1 : 0);

  const renderHeaderCell = (header: Header<TableFeatureMap, TData, unknown>) => {
    const extras = header.column.columnDef as TableColumnExtras;
    const align = resolveAlign(extras.align, extras.format);
    const canSort = header.column.getCanSort();
    const sorted = header.column.getIsSorted();
    const ariaSort = sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none";

    return (
      <TableHead
        key={header.id}
        colSpan={header.colSpan}
        aria-sort={canSort ? ariaSort : undefined}
        className={cn(canSort && "cursor-pointer select-none", ALIGN_CLASS[align])}
        style={minWidthStyle(extras.minWidth)}
      >
        {header.isPlaceholder
          ? null
          : canSort ? (
              <button
                type="button"
                className="inline-flex items-center gap-1"
                onClick={() => header.column.toggleSorting()}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
                {sorted === "asc" ? (
                  <ArrowUp className="size-3" aria-hidden="true" />
                ) : sorted === "desc" ? (
                  <ArrowDown className="size-3" aria-hidden="true" />
                ) : (
                  <ArrowUpDown className="text-muted-foreground size-3" aria-hidden="true" />
                )}
              </button>
            ) : (
              flexRender(header.column.columnDef.header, header.getContext())
            )}
      </TableHead>
    );
  };

  const renderBodyCell = (
    cell: Cell<TableFeatureMap, TData, unknown>,
    row: Row<TableFeatureMap, TData>,
  ) => {
    const extras = cell.column.columnDef as TableColumnExtras;
    const align = resolveAlign(extras.align, extras.format);
    const isCustom = customCellIds.has(cell.column.id);
    const isDetail =
      !isCustom && detailColumnId != null && cell.column.id === detailColumnId && Boolean(getDetailUrl);

    let content: React.ReactNode;
    if (isCustom) {
      content = flexRender(cell.column.columnDef.cell, cell.getContext());
    } else if (isDetail && getDetailUrl) {
      const url = getDetailUrl(row.original);
      const text = formatCellValue(extras.format, cell.getValue());
      content = url ? (
        <Link
          href={url}
          className="text-primary hover:underline font-medium underline-offset-4"
          onClick={(event) => event.stopPropagation()}
        >
          {text}
        </Link>
      ) : (
        text
      );
    } else {
      content = formatCellValue(extras.format, cell.getValue());
    }

    return (
      <TableCell
        key={cell.id}
        className={cn(ALIGN_CLASS[align], extras.truncate && "max-w-[14rem] truncate")}
        style={minWidthStyle(extras.minWidth)}
      >
        {content}
      </TableCell>
    );
  };

  return (
    <div className={className} data-slot="base-table">
      <Table
        containerClassName={stickyHeader ? "border" : undefined}
        containerStyle={containerStyle}
      >
        <TableHeader className={stickyHeader ? "sticky top-0 z-20 bg-background" : undefined}>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {showIndex ? (
                <TableHead
                  className={cn(
                    "text-muted-foreground w-12 text-center font-normal",
                    stickyIndex && "sticky left-0 z-10 bg-background",
                  )}
                >
                  #
                </TableHead>
              ) : null}
              {headerGroup.headers.map(renderHeaderCell)}
              {showActions ? (
                <TableHead
                  className={cn(
                    "w-24 text-right",
                    stickyActions && "sticky right-0 z-10 bg-background",
                  )}
                >
                  Thao tác
                </TableHead>
              ) : null}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={Math.max(1, totalColSpan)} className="text-center">
                <TableEmptyState variant={emptyVariant} onClear={onClearEmpty} />
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row, positionOnPage) => {
              const stt = computeStt(pageIndex, pageSize, positionOnPage);
              return (
                <TableRow
                  key={row.id}
                  data-stt={stt}
                  className={onRowClick ? "cursor-pointer" : undefined}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
                  {showIndex ? (
                    <TableCell
                      className={cn(
                        "text-muted-foreground w-12 text-center",
                        stickyIndex && "sticky left-0 z-10 bg-background",
                      )}
                    >
                      {stt}
                    </TableCell>
                  ) : null}
                  {row.getVisibleCells().map((cell) => renderBodyCell(cell, row))}
                  {showActions ? (
                    <TableCell
                      className={cn(stickyActions && "sticky right-0 z-10 bg-background")}
                    >
                      <TableActions row={row.original} actions={actions ?? []} />
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
