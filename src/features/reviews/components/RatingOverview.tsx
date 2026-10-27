'use client';

import type { RatingOverviewProps } from '@/features/reviews/types/rating-overview';
import { StarRating } from '@/features/reviews/components/StarRating';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';
const labelText = 'text-[11px] font-semibold uppercase tracking-[0.14em]';

function filterClassName(active: boolean) {
  return cn(
    'inline-flex items-center gap-1.5 border-b-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors',
    active
      ? 'border-landing-oxblood text-landing-oxblood'
      : 'border-transparent text-landing-muted hover:text-landing-obsidian',
    focusRing,
  );
}

export function RatingOverview({
  stats,
  selectedRating,
  onSelectRating,
}: RatingOverviewProps) {
  const avg = stats?.avgRating ? Number(stats.avgRating).toFixed(1) : '0.0';
  const count = stats?.reviewCount ?? 0;
  const dist = stats?.distribution ?? { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

  const starRows = [5, 4, 3, 2, 1] as const;

  return (
    <div className="border border-landing-line bg-landing-ivory p-5 md:p-7">
      <div className="flex flex-col gap-8 border-b border-landing-line pb-7 md:flex-row md:items-start md:gap-12">
        <div className="flex min-w-[200px] shrink-0 flex-col items-center justify-center text-center">
          <div className="font-mono text-[56px] font-medium leading-none tracking-tight text-landing-obsidian">
            {avg}
          </div>
          <StarRating value={Number(avg)} size="lg" tone="landing" className="mt-3" />
          <p className="mt-2 text-xs text-landing-muted">
            {count > 0 ? `Dựa trên ${count} lượt đánh giá` : 'Chưa có lượt đánh giá nào'}
          </p>
        </div>

        <div className="flex w-full max-w-[500px] flex-1 flex-col gap-2.5">
          {starRows.map((star) => {
            const numCount = dist[String(star) as keyof typeof dist] || 0;
            const percentage = count > 0 ? Math.round((numCount / count) * 100) : 0;
            const isRowSelected = selectedRating === star;

            return (
              <button
                key={star}
                type="button"
                onClick={() => onSelectRating(isRowSelected ? undefined : star)}
                aria-pressed={isRowSelected}
                aria-label={`Lọc ${star} sao (${numCount} đánh giá)`}
                className={cn('flex w-full items-center gap-3 text-left transition-opacity hover:opacity-80', focusRing)}
              >
                <span className="flex w-10 shrink-0 items-center gap-1 font-mono text-xs text-landing-muted">
                  {star}
                  <Star className="h-3 w-3 fill-landing-oxblood text-landing-oxblood" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="relative h-2 flex-1 overflow-hidden bg-landing-paper">
                  <span
                    className={cn(
                      'block h-full transition-all duration-500',
                      isRowSelected ? 'bg-landing-oxblood' : 'bg-landing-taupe',
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </span>
                <span className="w-10 shrink-0 text-right font-mono text-[11px] text-landing-muted">
                  {percentage}%
                </span>
                <span className="w-9 shrink-0 text-right font-mono text-[11px] text-landing-muted">
                  ({numCount})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-5">
        <span className={cn('text-landing-brass-ink', labelText)}>Lọc theo</span>
        <button
          type="button"
          onClick={() => onSelectRating(undefined)}
          aria-pressed={selectedRating === undefined}
          className={filterClassName(selectedRating === undefined)}
        >
          Tất cả {count > 0 ? `(${count})` : ''}
        </button>

        {starRows.map((star) => {
          const numCount = dist[String(star) as keyof typeof dist] || 0;
          const isSelected = selectedRating === star;

          return (
            <button
              key={star}
              type="button"
              onClick={() => onSelectRating(isSelected ? undefined : star)}
              aria-pressed={isSelected}
              className={filterClassName(isSelected)}
            >
              <span>{star} sao</span>
              <span className={cn('font-mono text-[10px]', isSelected ? 'text-landing-oxblood/70' : 'text-landing-muted')}>
                ({numCount})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
