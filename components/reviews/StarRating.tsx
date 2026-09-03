'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number; // 0 to 5
  onChange?: (value: number) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
  readOnly?: boolean;
}

const SIZE_MAP = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function StarRating({
  value,
  onChange,
  size = 'md',
  showValue = false,
  className = '',
  readOnly = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const isInteractive = !readOnly && typeof onChange === 'function';

  const starSizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  const displayRating = hoverValue !== null ? hoverValue : value;

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
              className={`relative transition-transform ${
                isInteractive
                  ? 'cursor-pointer hover:scale-115 active:scale-95 focus:outline-none'
                  : 'cursor-default pointer-events-none'
              }`}
              aria-label={`${starIndex} sao`}
            >
              {isHalf ? (
                <div className="relative">
                  <Star className={`${starSizeClass} text-neutral-200 fill-neutral-200`} />
                  <div className="absolute inset-0 overflow-hidden w-1/2">
                    <Star className={`${starSizeClass} text-[#F59E0B] fill-[#F59E0B]`} />
                  </div>
                </div>
              ) : (
                <Star
                  className={`${starSizeClass} transition-colors ${
                    isFull
                      ? 'text-[#F59E0B] fill-[#F59E0B]'
                      : 'text-neutral-200 fill-neutral-100'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-body-sm font-semibold text-neutral-700 ml-1">
          {Number(value).toFixed(1)}
        </span>
      )}
    </div>
  );
}
