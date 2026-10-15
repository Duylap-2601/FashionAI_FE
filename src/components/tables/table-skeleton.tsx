"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface TableSkeletonProps {
  columnCount: number;
  rowCount?: number;
  showIndex?: boolean;
  showActions?: boolean;
  className?: string;
}

/**
 * Loading placeholder that mirrors the real table's column structure (index + data +
 * actions) so the layout does not jump once data arrives.
 */
export function TableSkeleton({
  columnCount,
  rowCount = 5,
  showIndex = true,
  showActions = false,
  className,
}: TableSkeletonProps) {
  const cells = Math.max(1, columnCount);
  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {showIndex ? <TableHead className="w-12" /> : null}
            {Array.from({ length: cells }, (_, i) => (
              <TableHead key={`sk-head-${i}`}>
                <Skeleton className="h-4 w-20" />
              </TableHead>
            ))}
            {showActions ? <TableHead className="w-24" /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: Math.max(1, rowCount) }, (_, rowIndex) => (
            <TableRow key={`sk-row-${rowIndex}`}>
              {showIndex ? (
                <TableCell>
                  <Skeleton className="h-4 w-6" />
                </TableCell>
              ) : null}
              {Array.from({ length: cells }, (_, colIndex) => (
                <TableCell key={`sk-cell-${rowIndex}-${colIndex}`}>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
              ))}
              {showActions ? (
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
