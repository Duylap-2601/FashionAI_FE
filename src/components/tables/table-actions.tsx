"use client";

import type { RowData } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { RowActionDef } from "./table-types";

export interface TableActionsProps<TData extends RowData> {
  row: TData;
  actions: readonly RowActionDef<TData>[];
}

/**
 * Icon-only row actions. Each button carries both a tooltip and an `aria-label`.
 * Destructive actions never run their own delete — the caller wires `onClick` to its
 * own confirmation flow; `destructive` only affects styling.
 */
export function TableActions<TData extends RowData>({ row, actions }: TableActionsProps<TData>) {
  const visible = actions.filter((action) => !action.hidden?.(row));
  if (visible.length === 0) return null;

  return (
    <div className="flex items-center justify-end gap-1" data-slot="table-row-actions">
      {visible.map((action) => {
        const disabled = action.disabled?.(row) ?? false;
        return (
          <Tooltip key={action.id}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={action.label}
                disabled={disabled}
                data-action-id={action.id}
                onClick={(event) => {
                  event.stopPropagation();
                  action.onClick(row);
                }}
              >
                {action.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{action.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
