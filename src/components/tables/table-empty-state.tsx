"use client";

import { Inbox, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TableEmptyVariant } from "./table-types";

export interface TableEmptyStateProps {
  variant: TableEmptyVariant;
  onClear?: () => void;
  className?: string;
}

/**
 * Distinguishes "no records at all" from "no rows match the current search/filters".
 * The no-match variant offers a Clear action.
 */
export function TableEmptyState({ variant, onClear, className }: TableEmptyStateProps) {
  const isNoMatch = variant === "no-match";
  const Icon = isNoMatch ? SearchX : Inbox;
  return (
    <div
      data-slot="table-empty-state"
      data-variant={variant}
      className={className ?? "flex flex-col items-center justify-center gap-3 py-12 text-center"}
    >
      <Icon className="text-muted-foreground size-10" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {isNoMatch ? "Không tìm thấy kết quả phù hợp" : "Chưa có bản ghi nào"}
        </p>
        <p className="text-muted-foreground text-sm">
          {isNoMatch
            ? "Hãy thử thay đổi từ khóa hoặc bộ lọc."
            : "Dữ liệu sẽ xuất hiện tại đây khi có."}
        </p>
      </div>
      {isNoMatch && onClear ? (
        <Button type="button" variant="outline" size="sm" onClick={onClear}>
          Xóa bộ lọc
        </Button>
      ) : null}
    </div>
  );
}
