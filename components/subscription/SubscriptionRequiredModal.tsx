'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Crown, X, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface SubscriptionRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'free_not_allowed' | 'subscription_expired' | string;
  actionName?: string;
}

export function SubscriptionRequiredModal({
  isOpen,
  onClose,
  reason = 'free_not_allowed',
  actionName = 'Thử đồ AI',
}: SubscriptionRequiredModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const isExpired = reason === 'subscription_expired';

  const handleGoToSubscription = () => {
    onClose();
    router.push('/subscription');
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-[480px] bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-neutral-100 z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#5D1C34]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#A67D44]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5D1C34] to-[#A67D44] text-white flex items-center justify-center mb-5 shadow-md shadow-[#5D1C34]/20">
          <Crown className="w-7 h-7" />
        </div>

        {/* Title & Desc */}
        <h3 className="text-[22px] font-bold text-brand-navy leading-tight mb-2">
          {isExpired ? 'Gói của bạn đã hết hạn' : `Nâng cấp để sử dụng ${actionName}`}
        </h3>
        <p className="text-body-sm text-neutral-600 mb-6 leading-relaxed">
          {isExpired
            ? 'Thời hạn gói cước hội viên của bạn đã kết thúc. Hãy gia hạn gói để tiếp tục trải nghiệm tính năng thử đồ và tư vấn may đo chuẩn xác.'
            : `Tính năng "${actionName}" yêu cầu gói hội viên trả phí (MEMBER hoặc VIP). Nâng cấp ngay để mở khóa lượt thử đồ mỗi ngày cùng công nghệ AI độc quyền.`}
        </p>

        {/* Tier Highlights */}
        <div className="space-y-3 mb-6">
          <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#5D1C34]/10 text-[#5D1C34] flex items-center justify-center font-bold text-xs">
                M
              </div>
              <div>
                <p className="text-body-sm font-bold text-brand-navy">Gói MEMBER</p>
                <p className="text-[12px] text-neutral-500">5 lượt Try-on / ngày · 30 ngày</p>
              </div>
            </div>
            <span className="text-body-sm font-bold text-[#5D1C34]">49.000đ</span>
          </div>

          <div className="p-3.5 bg-gradient-to-r from-[#5D1C34]/5 to-[#A67D44]/10 rounded-2xl border border-[#A67D44]/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5D1C34] to-[#A67D44] text-white flex items-center justify-center font-bold text-xs">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <p className="text-body-sm font-bold text-brand-navy">Gói VIP</p>
                <p className="text-[12px] text-neutral-500">10 lượt Try-on / ngày · Stylist & Chatbot ∞</p>
              </div>
            </div>
            <span className="text-body-sm font-bold text-[#5D1C34]">99.000đ</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleGoToSubscription}
            className="w-full h-[50px] bg-gradient-to-r from-[#5D1C34] to-[#A67D44] text-white text-body-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-md shadow-[#5D1C34]/20 cursor-pointer"
          >
            {isExpired ? 'Gia hạn gói ngay' : 'Xem các gói nâng cấp'} <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-center text-body-sm text-neutral-500 hover:text-neutral-800 font-medium transition-colors"
          >
            Để sau
          </button>
        </div>
      </div>
    </div>
  );
}
