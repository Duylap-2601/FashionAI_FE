"use client";

import type { RowData } from "@tanstack/react-table";
import { Columns3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TableInstance } from "./table-types";

export interface TableColumnVisibilityProps<TData extends RowData> {
  table: TableInstance<TData>;
  label?: string;
}

function columnLabel(column: { id: string; columnDef: { header?: unknown } }): string {
  return typeof column.columnDef.header === "string" ? column.columnDef.header : column.id;
}

/**
 * Toggles visibility of data columns. STT and the actions column are not real columns,
 * so they always stay visible.
 */
export function TableColumnVisibility<TData extends RowData>({
  table,
  label = "Cột",
}: TableColumnVisibilityProps<TData>) {
  const columns = table.getAllLeafColumns().filter((column) => column.getCanHide());
  if (columns.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" aria-label="Hiển thị cột">
          <Columns3 aria-hidden="true" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Hiển thị cột</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={table.getIsAllColumnsVisible()}
          onCheckedChange={() => table.toggleAllColumnsVisible()}
          onSelect={(event) => event.preventDefault()}
        >
          Tất cả
        </DropdownMenuCheckboxItem>
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={() => column.toggleVisibility()}
            onSelect={(event) => event.preventDefault()}
          >
            {columnLabel(column)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
