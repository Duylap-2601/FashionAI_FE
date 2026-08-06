'use client';

import React from 'react';
import { Sparkles, X } from 'lucide-react';
import Link from 'next/link';

interface QuotaExhaustedModalProps {
  onClose: () => void;
}

export function QuotaExhaustedModal({ onClose }: QuotaExhaustedModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-[400px] w-full p-8 flex flex-col items-center gap-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
        >
          <X className="w-4 h-4 text-neutral-400" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-amber-500" />
        </div>

        <div className="text-center flex flex-col gap-2">
          <h2 className="text-heading-h3 font-bold text-neutral-900">Hết lượt tư vấn hôm nay</h2>
          <p className="text-body-sm text-neutral-500 leading-relaxed">
            Bạn đã dùng hết lượt AI Stylist trong ngày. Nâng cấp tài khoản để có thêm lượt và
            nhiều tính năng độc quyền khác.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/products"
            className="w-full h-12 bg-brand-navy text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-brand-navy/90 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-brand-gold animate-bounce" />
            Mua sắm ngay
          </Link>
          <button
            onClick={onClose}
            className="w-full h-12 border border-neutral-200 text-neutral-600 rounded-xl font-medium hover:bg-neutral-50 transition-colors"
          >
            Đóng
          </button>
        </div>

        <p className="text-label-sm text-neutral-400 text-center">
          Lượt dùng được reset lúc 00:00 mỗi ngày
        </p>
      </div>
    </div>
  );
}
