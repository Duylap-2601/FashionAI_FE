'use client';

import type { QuotaExhaustedModalProps } from '@/features/stylist/types/quota-exhausted-modal';
import { ArrowRight, Clock, X } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export function QuotaExhaustedModal({
  onClose,
  actionName = 'AI Stylist',
  resetAt,
  requested,
  remaining,
}: QuotaExhaustedModalProps) {
  const formattedResetTime = React.useMemo(() => {
    if (!resetAt) return '00:00 ngày mai';
    try {
      const date = new Date(resetAt);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' (' + date.toLocaleDateString('vi-VN') + ')';
    } catch {
      return '00:00 ngày mai';
    }
  }, [resetAt]);

  const hasDeficit = requested !== undefined && remaining !== undefined && requested > remaining;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-landing-obsidian/55 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="quota-exhausted-title" className="relative flex w-full max-w-[420px] flex-col items-center gap-6 border border-landing-line bg-landing-paper p-6 text-landing-obsidian animate-in fade-in-0 duration-200 md:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center text-landing-muted transition-colors hover:text-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>

        <div className="flex h-14 w-14 items-center justify-center rounded-[2px] border border-landing-line text-landing-brass-ink">
          <Clock className="h-7 w-7" strokeWidth={1.5} />
        </div>

        <div className="flex flex-col gap-2 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-landing-brass-ink">Hết lượt trong ngày</p>
          <h2 id="quota-exhausted-title" className="font-display text-2xl leading-tight text-landing-obsidian">
            {hasDeficit ? 'Không đủ lượt trong ngày' : `Hết lượt ${actionName} hôm nay`}
          </h2>
          <p className="text-sm leading-relaxed text-landing-muted">
            {hasDeficit
              ? `Yêu cầu này cần ${requested} lượt nhưng bạn chỉ còn ${remaining} lượt trong ngày. Quota sẽ được đặt lại lúc ${formattedResetTime}.`
              : `Bạn đã sử dụng hết lượt ${actionName} trong ngày. Quota sẽ được đặt lại lúc ${formattedResetTime}.`}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <Link
            href="/subscription"
            onClick={onClose}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[2px] bg-landing-oxblood text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-paper transition-colors hover:bg-landing-obsidian focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
          >
            Nâng cấp gói tài khoản <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full rounded-[2px] border border-landing-obsidian/70 text-[11px] font-semibold uppercase tracking-[0.18em] text-landing-obsidian transition-colors hover:border-landing-oxblood hover:text-landing-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
          >
            Đóng
          </button>
        </div>

        <p className="text-center text-xs text-landing-muted">
          Lượt dùng được tự động làm mới vào 00:00 (UTC+7) mỗi ngày.
        </p>
      </div>
    </div>
  );
}

