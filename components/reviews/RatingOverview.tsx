'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { ReviewStats } from '@/hooks/useReviews';
import { StarRating } from './StarRating';

interface RatingOverviewProps {
  stats?: ReviewStats;
  selectedRating?: number;
  onSelectRating: (rating?: number) => void;
  isLoading?: boolean;
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
    <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-2xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 pb-8 border-b border-neutral-200">
        {/* Điểm số trung bình lớn */}
        <div className="flex flex-col items-center justify-center text-center shrink-0 min-w-[200px]">
          <div className="text-[56px] font-black text-brand-navy tracking-tight leading-none mb-2">
            {avg}
          </div>
          <StarRating value={Number(avg)} size="lg" className="mb-2" />
          <p className="text-body-sm text-neutral-500 font-medium">
            {count > 0 ? `Dựa trên ${count} lượt đánh giá` : 'Chưa có lượt đánh giá nào'}
          </p>
        </div>

        {/* Thanh phân bố tỷ lệ từng sao (5★ -> 1★) */}
        <div className="flex-1 w-full flex flex-col gap-2.5 max-w-[500px]">
          {starRows.map((s) => {
            const numCount = dist[String(s) as keyof typeof dist] || 0;
            const percentage = count > 0 ? Math.round((numCount / count) * 100) : 0;
            const isRowSelected = selectedRating === s;

            return (
              <button
                key={s}
                type="button"
                onClick={() => onSelectRating(isRowSelected ? undefined : s)}
                className={`flex items-center gap-3 text-label-sm font-medium w-full text-left transition-opacity hover:opacity-80 cursor-pointer ${
                  isRowSelected ? 'font-bold text-brand-navy' : 'text-neutral-600'
                }`}
                title={`Lọc ${s} sao (${numCount} đánh giá)`}
              >
                <div className="flex items-center gap-1 w-10 shrink-0">
                  <span>{s}</span>
                  <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                </div>
                <div className="flex-1 h-2.5 bg-neutral-200 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isRowSelected ? 'bg-[#5D1C34]' : 'bg-[#F59E0B]'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-12 text-right text-[12px] text-neutral-400 shrink-0">
                  {percentage}%
                </div>
                <div className="w-10 text-right text-[12px] text-neutral-500 shrink-0 font-medium">
                  ({numCount})
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs Lọc theo số sao */}
      <div className="flex items-center gap-2 pt-6 flex-wrap">
        <span className="text-body-sm font-semibold text-neutral-700 mr-2">Lọc theo:</span>
        <button
          type="button"
          onClick={() => onSelectRating(undefined)}
          className={`px-4 py-2 rounded-xl text-body-sm font-medium transition-all cursor-pointer ${
            selectedRating === undefined
              ? 'bg-brand-navy text-white shadow-xs'
              : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
          }`}
        >
          Tất cả {count > 0 && `(${count})`}
        </button>

        {starRows.map((s) => {
          const numCount = dist[String(s) as keyof typeof dist] || 0;
          const isSelected = selectedRating === s;

          return (
            <button
              key={s}
              type="button"
              onClick={() => onSelectRating(isSelected ? undefined : s)}
              className={`px-4 py-2 rounded-xl text-body-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-brand-navy text-white shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <span>{s} sao</span>
              <span className={`text-[12px] ${isSelected ? 'text-white/80' : 'text-neutral-400'}`}>
                ({numCount})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
