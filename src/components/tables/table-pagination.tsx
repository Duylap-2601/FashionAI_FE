"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/components/ui/utils";
import { PAGE_SIZE_OPTIONS, clampPage, formatRange } from "./table-utils";

export interface TablePaginationProps {
  /** 0-based page index. */
  pageIndex: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  itemLabel?: string;
  pageSizeOptions?: readonly number[];
  className?: string;
}

type PageToken = number | "gap";

function pageWindow(current: number, count: number): PageToken[] {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index);
  const pages = new Set<number>(
    [0, count - 1, current - 1, current, current + 1].filter((page) => page >= 0 && page < count),
  );
  const sorted = [...pages].sort((a, b) => a - b);
  const tokens: PageToken[] = [];
  let previous = -1;
  for (const page of sorted) {
    if (previous !== -1 && page - previous > 1) tokens.push("gap");
    tokens.push(page);
    previous = page;
  }
  return tokens;
}

/**
 * 0-based pagination control. Wording follows "Hiển thị X - Y trong Z bản ghi". Written
 * independently of `features/admin`.
 */
export function TablePagination({
  pageIndex,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
  itemLabel = "bản ghi",
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  className,
}: TablePaginationProps) {
  if (totalRows <= 0) return null;

  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
  const current = clampPage(pageIndex, pageSize, totalRows);
  const tokens = pageWindow(current, pageCount);

  return (
    <div
      className={cn("flex flex-wrap items-center justify-between gap-3", className)}
      data-slot="table-pagination"
    >
      <p className="text-muted-foreground text-sm" data-testid="pagination-range">
        {formatRange(current, pageSize, totalRows, itemLabel)}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="h-8 w-24 text-sm" aria-label="Số dòng mỗi trang">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} / trang
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label="Trang trước"
            disabled={current <= 0}
            onClick={() => onPageChange(current - 1)}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>

          {tokens.map((token, index) =>
            token === "gap" ? (
              <span key={`gap-${index}`} className="text-muted-foreground px-1 text-sm" aria-hidden="true">
                …
              </span>
            ) : (
              <Button
                key={token}
                type="button"
                variant={token === current ? "default" : "outline"}
                size="icon"
                className="size-8"
                aria-label={`Trang ${token + 1}`}
                aria-current={token === current ? "page" : undefined}
                onClick={() => onPageChange(token)}
              >
                {token + 1}
              </Button>
            ),
          )}

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label="Trang sau"
            disabled={current >= pageCount - 1}
            onClick={() => onPageChange(current + 1)}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}

