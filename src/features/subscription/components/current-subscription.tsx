'use client';

import type { CurrentSubscriptionProps } from '@/features/subscription/types/current-subscription';
import {
  Clock,
  Crown,
  Shield,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export function CurrentSubscription({ tier, current, getStatusBadge, setActiveTab, handleInitiateUpgrade, formatDate, rawExpiresAt, expirationInfo, scheduled, handleToggleAutoRenew, isCancelling, isResuming }: CurrentSubscriptionProps) {
  return (
    <div className="max-w-[840px] mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Main Current Subscription Card */}
      <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-sm ${tier === 'VIP'
                ? 'bg-gradient-to-br from-[#5D1C34] to-[#A67D44] text-white'
                : tier === 'MEMBER'
                  ? 'bg-[#5D1C34] text-white'
                  : 'bg-neutral-100 text-neutral-600'
              }`}>
              {tier === 'VIP' ? <Crown className="w-8 h-8" /> : tier === 'MEMBER' ? <Sparkles className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
            </div>
            <div>
              <span className="text-[12px] font-bold text-neutral-400 uppercase tracking-wider">Gói hiện tại</span>
              <h2 className="text-[26px] font-bold text-brand-navy flex items-center gap-2.5">
                Gói {tier}
                {current && getStatusBadge(current.status)}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {tier === 'FREE' ? (
              <button
                onClick={() => setActiveTab('plans')}
                className="px-6 py-3 bg-[#5D1C34] text-white font-bold rounded-xl text-body-sm hover:bg-[#5D1C34]/90 transition-colors shadow-sm"
              >
                Nâng cấp ngay
              </button>
            ) : (
              <button
                onClick={() => handleInitiateUpgrade(tier === 'MEMBER' ? 'VIP' : 'VIP')}
                className="px-5 py-2.5 bg-brand-navy text-white font-bold rounded-xl text-body-sm hover:bg-brand-navy/90 transition-colors shadow-sm"
              >
                Gia hạn thêm 30 ngày
              </button>
            )}
          </div>
        </div>

        {/* Status details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-neutral-100">
          <div>
            <span className="text-[12px] text-neutral-400 block mb-1">Thời hạn sử dụng</span>
            <span className="text-body-md font-bold text-brand-navy">
              {formatDate(rawExpiresAt)}
            </span>
          </div>
          <div>
            <span className="text-[12px] text-neutral-400 block mb-1">Số ngày còn lại</span>
            <span className="text-body-md font-bold text-[#5D1C34]">
              {expirationInfo ? `${expirationInfo.daysRemaining} ngày` : 'Không giới hạn'}
            </span>
          </div>
          <div>
            <span className="text-[12px] text-neutral-400 block mb-1">Nhắc thanh toán gia hạn</span>
            <span className="text-body-md font-bold text-brand-navy">
              {current ? (current.autoRenew ? 'Đang bật' : 'Đã tắt') : '—'}
            </span>
          </div>
        </div>

        {/* Scheduled Downgrade Notice if any */}
        {scheduled && (
          <div className="my-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-body-sm font-bold text-blue-900">
                Gói {scheduled.tier} đã được lên lịch kích hoạt
              </h4>
              <p className="text-[13px] text-blue-800 mt-0.5">
                Gói {scheduled.tier} sẽ tự động bắt đầu từ ngày <strong>{formatDate(scheduled.startsAt)}</strong> sau khi gói hiện tại hết hạn.
              </p>
            </div>
          </div>
        )}

        {/* Auto-renew switch action */}
        {current && (
          <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-body-sm font-bold text-brand-navy">Tự động nhắc gia hạn</h4>
              <p className="text-[13px] text-neutral-500 mt-0.5">
                {current.autoRenew
                  ? 'Hệ thống sẽ gửi thông báo và email trước 3 ngày khi gói sắp hết hạn kèm link thanh toán nhanh.'
                  : 'Bạn đã tắt nhắc gia hạn. Gói sẽ tự động chuyển về FREE khi đến ngày hết hạn.'}
              </p>
            </div>

            <button
              onClick={handleToggleAutoRenew}
              disabled={isCancelling || isResuming}
              className={`px-4 py-2.5 rounded-xl font-bold text-body-sm transition-all shrink-0 cursor-pointer ${current.autoRenew
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                } disabled:opacity-50`}
            >
              {isCancelling || isResuming
                ? 'Đang xử lý...'
                : current.autoRenew
                  ? 'Tắt tự động gia hạn'
                  : 'Bật lại tự động gia hạn'}
            </button>
          </div>
        )}
      </div>

      {/* Explanation card about SePay reminder */}
      <div className="p-6 bg-[#FDFBF7] rounded-3xl border border-[#F0EEE9] text-body-sm text-neutral-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-brand-navy">
          <ShieldCheck className="w-5 h-5 text-[#5D1C34]" /> Bảo mật & Minh bạch thanh toán
        </div>
        <p className="leading-relaxed">
          FashionAI sử dụng cổng VietQR SePay theo từng lần thanh toán. Hệ thống không lưu trữ thông tin thẻ hay tự động trừ tiền trong tài khoản của bạn. &quot;Tự động gia hạn&quot; đóng vai trò gửi lời nhắc tiện lợi để bạn không bị gián đoạn trải nghiệm thử đồ AI.
        </p>
      </div>
    </div>
  );
}
