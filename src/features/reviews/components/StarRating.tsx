'use client';

import { SIZE_MAP } from '@/features/reviews/constants/star-rating';
import type { StarRatingProps } from '@/features/reviews/types/star-rating';
import { Star } from 'lucide-react';
import { useState } from 'react';

export function StarRating({
  value,
  onChange,
  size = 'md',
  showValue = false,
  className = '',
  readOnly = false,
  tone = 'default',
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const isInteractive = !readOnly && typeof onChange === 'function';

  const starSizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  const displayRating = hoverValue !== null ? hoverValue : value;
  const filledClass = tone === 'landing' ? 'text-landing-oxblood fill-landing-oxblood' : 'text-[#F59E0B] fill-[#F59E0B]';
  const emptyClass = tone === 'landing' ? 'text-landing-taupe fill-transparent' : 'text-neutral-200 fill-neutral-100';

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFull = displayRating >= starIndex;
          const isHalf = !isFull && displayRating >= starIndex - 0.5;

          return (
            <button
              key={starIndex}
              type="button"
              disabled={!isInteractive}
              onClick={() => isInteractive && onChange(starIndex)}
              onMouseEnter={() => isInteractive && setHoverValue(starIndex)}
              onMouseLeave={() => isInteractive && setHoverValue(null)}
              className={`relative transition-transform ${isInteractive
                  ? 'cursor-pointer hover:scale-115 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current'
                  : 'cursor-default pointer-events-none'
                }`}
              aria-label={`${starIndex} sao`}
            >
              {isHalf ? (
                <div className="relative">
                  <Star className={`${starSizeClass} ${emptyClass}`} />
                  <div className="absolute inset-0 overflow-hidden w-1/2">
                    <Star className={`${starSizeClass} ${filledClass}`} />
                  </div>
                </div>
              ) : (
                <Star
                  className={`${starSizeClass} transition-colors ${isFull ? filledClass : emptyClass}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className={tone === 'landing' ? 'ml-1 font-mono text-xs text-landing-obsidian' : 'text-body-sm font-semibold text-neutral-700 ml-1'}>
          {Number(value).toFixed(1)}
        </span>
      )}
    </div>
  );
}
