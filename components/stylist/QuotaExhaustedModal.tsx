'use client';

import React from 'react';
import { Sparkles, X, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface QuotaExhaustedModalProps {
  onClose: () => void;
  actionName?: string;
  resetAt?: string | null;
  requested?: number;
  remaining?: number;
}

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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-[420px] w-full p-6 md:p-8 flex flex-col items-center gap-6 relative border border-neutral-100 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
          <Clock className="w-8 h-8" />
        </div>

        <div className="text-center flex flex-col gap-2">
          <h2 className="text-[20px] font-bold text-brand-navy">
            {hasDeficit ? 'Không đủ lượt trong ngày' : `Hết lượt ${actionName} hôm nay`}
          </h2>
          <p className="text-body-sm text-neutral-600 leading-relaxed">
            {hasDeficit
              ? `Yêu cầu này cần ${requested} lượt nhưng bạn chỉ còn ${remaining} lượt trong ngày. Quota sẽ được đặt lại lúc ${formattedResetTime}.`
              : `Bạn đã sử dụng hết lượt ${actionName} trong ngày. Quota sẽ được đặt lại lúc ${formattedResetTime}.`}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <Link
            href="/subscription"
            onClick={onClose}
            className="w-full h-12 bg-gradient-to-r from-[#5D1C34] to-[#A67D44] text-white rounded-xl font-bold text-body-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Nâng cấp gói tài khoản <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={onClose}
            className="w-full h-11 border border-neutral-200 text-neutral-600 rounded-xl font-semibold text-body-sm hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

        <p className="text-label-sm text-neutral-400 text-center">
          Lượt dùng được tự động làm mới vào 00:00 (UTC+7) mỗi ngày.
        </p>
      </div>
    </div>
  );
}

