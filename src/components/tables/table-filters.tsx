"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

import type { TableFilterDef, TableFilterValue, TableFilterValues } from "./table-types";
import { isFilterActive } from "./table-utils";

export interface TableFiltersProps {
  filters: readonly TableFilterDef[];
  values: TableFilterValues;
  onChange: (values: TableFilterValues) => void;
}

function withFilter(values: TableFilterValues, id: string, value: TableFilterValue): TableFilterValues {
  return { ...values, [id]: value };
}

function optionLabel(def: TableFilterDef, value: string): string {
  return def.options?.find((option) => option.value === value)?.label ?? value;
}

function multiValues(value: TableFilterValue): string[] {
  return Array.isArray(value) ? value : [];
}

function boolValue(value: TableFilterValue): "true" | "false" | "" {
  if (typeof value === "boolean") return value ? "true" : "false";
  return "";
}

function rangeValue(value: TableFilterValue): { from: string; to: string } {
  if (value && typeof value === "object" && "from" in value) {
    return { from: value.from ?? "", to: value.to ?? "" };
  }
  return { from: "", to: "" };
}

function chipText(def: TableFilterDef, value: TableFilterValue): string {
  switch (def.type) {
    case "multi-select": {
      const labels = multiValues(value).map((v) => optionLabel(def, v));
      return `${def.label}: ${labels.join(", ")}`;
    }
    case "boolean":
      return `${def.label}: ${value ? "Có" : "Không"}`;
    case "date-range": {
      const { from, to } = rangeValue(value);
      const parts = [from, to].filter(Boolean);
      return `${def.label}: ${parts.join(" - ")}`;
    }
    case "select":
    default:
      return `${def.label}: ${optionLabel(def, String(value))}`;
  }
}

/**
 * Renders a set of filter fields (select, multi-select, boolean, date-range) plus a row
 * of chips for active filters. Options and labels are always caller-provided so no
 * business values are hard-coded here.
 */
export function TableFilters({ filters, values, onChange }: TableFiltersProps) {
  const activeChips = filters
    .filter((def) => isFilterActive(values[def.id]))
    .map((def) => ({ def, value: values[def.id] }));

  return (
    <div className="flex flex-wrap items-center gap-2" data-slot="table-filters">
      {filters.map((def) => {
        const value = values[def.id];
        if (def.type === "multi-select") {
          const selected = multiValues(value);
          return (
            <DropdownMenu key={def.id}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="max-w-56"
                  aria-label={def.label}
                  data-filter-id={def.id}
                >
                  <span className="truncate">
                    {selected.length > 0 ? `${def.label} (${selected.length})` : def.label}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuLabel>{def.label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {def.options?.map((option) => {
                  const checked = selected.includes(option.value);
                  return (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={checked}
                      onSelect={(event) => event.preventDefault()}
                      onCheckedChange={() => {
                        const next = checked
                          ? selected.filter((v) => v !== option.value)
                          : [...selected, option.value];
                        onChange(withFilter(values, def.id, next));
                      }}
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        if (def.type === "boolean") {
          return (
            <Select
              key={def.id}
              value={boolValue(value)}
              onValueChange={(next) =>
                onChange(withFilter(values, def.id, next === "" ? null : next === "true"))
              }
            >
              <SelectTrigger className="w-36" aria-label={def.label} data-filter-id={def.id}>
                <SelectValue placeholder={def.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{def.label}</SelectItem>
                <SelectItem value="true">Có</SelectItem>
                <SelectItem value="false">Không</SelectItem>
              </SelectContent>
            </Select>
          );
        }

        if (def.type === "date-range") {
          const { from, to } = rangeValue(value);
          const update = (patch: Partial<{ from: string; to: string }>) => {
            const merged = { from, to, ...patch };
            onChange(withFilter(values, def.id, merged));
          };
          return (
            <div
              key={def.id}
              className="flex items-center gap-1"
              role="group"
              aria-label={def.label}
              data-filter-id={def.id}
            >
              <Input
                type="date"
                value={from}
                aria-label={`${def.label} từ`}
                className="w-36"
                onChange={(event) => update({ from: event.target.value })}
              />
              <span aria-hidden="true">–</span>
              <Input
                type="date"
                value={to}
                aria-label={`${def.label} đến`}
                className="w-36"
                onChange={(event) => update({ to: event.target.value })}
              />
            </div>
          );
        }

        return (
          <Select
            key={def.id}
            value={typeof value === "string" ? value : ""}
            onValueChange={(next) => onChange(withFilter(values, def.id, next || null))}
          >
            <SelectTrigger className="w-40" aria-label={def.label} data-filter-id={def.id}>
              <SelectValue placeholder={def.label} />
            </SelectTrigger>
            <SelectContent>
              {def.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      })}

      {activeChips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1">
          {activeChips.map(({ def, value }) => (
            <span
              key={def.id}
              className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs"
            >
              {chipText(def, value)}
              <button
                type="button"
                aria-label={`Xóa bộ lọc ${def.label}`}
                className="hover:text-foreground"
                onClick={() => onChange(withFilter(values, def.id, null))}
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </span>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange({})}
            data-testid="clear-filters"
          >
            Xóa bộ lọc
          </Button>
        </div>
      ) : null}
    </div>
  );
}
