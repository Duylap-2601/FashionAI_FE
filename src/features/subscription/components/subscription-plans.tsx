'use client';

import type { TargetTier } from '@/features/payments/types/payments';
import { DEFAULT_PLANS } from '@/features/subscription/constants/subscription-page';
import type { SubscriptionPlansProps } from '@/features/subscription/types/subscription-plans';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Crown,
  RefreshCw,
  Shield,
  Sparkles
} from 'lucide-react';

export function SubscriptionPlans({ status, tier, expirationInfo, scheduled, handleInitiateUpgrade, isCheckoutLoading }: SubscriptionPlansProps) {
  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Current Tier Quick Summary Banner */}
      {status === 'authenticated' && (
        <div className="p-6 md:p-8 bg-white rounded-3xl border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 shadow-sm ${tier === 'VIP'
                ? 'bg-gradient-to-br from-[#5D1C34] to-[#A67D44] text-white'
                : tier === 'MEMBER'
                  ? 'bg-[#5D1C34] text-white'
                  : 'bg-neutral-100 text-neutral-600'
              }`}>
              {tier === 'VIP' ? <Crown className="w-7 h-7" /> : tier === 'MEMBER' ? <Sparkles className="w-7 h-7" /> : <Shield className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-heading-h3 font-bold text-brand-navy">
                  Tài khoản của bạn: Gói {tier}
                </h3>
                {expirationInfo && !expirationInfo.isExpired && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-bold ${expirationInfo.isExpiringSoon
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-green-100 text-green-800'
                    }`}>
                    {expirationInfo.isExpiringSoon ? 'Sắp hết hạn' : 'Đang hoạt động'}
                  </span>
                )}
              </div>

              {expirationInfo ? (
                expirationInfo.isExpired ? (
                  <p className="text-body-sm text-semantic-error mt-1 flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-4 h-4" /> Gói cước đã hết hạn vào ngày {expirationInfo.formattedDate}. Vui lòng gia hạn để tiếp tục dùng Thử đồ AI.
                  </p>
                ) : (
                  <p className="text-body-sm text-neutral-600 mt-1 flex items-center gap-2 flex-wrap">
                    <span>Thời hạn đến: <strong className="text-brand-navy">{expirationInfo.formattedDate}</strong></span>
                    <span>•</span>
                    <span className="text-[#5D1C34] font-semibold">Còn {expirationInfo.daysRemaining} ngày sử dụng</span>
                  </p>
                )
              ) : (
                <p className="text-body-sm text-neutral-500 mt-1">
                  {tier === 'FREE' ? 'Nâng cấp ngay để mở khóa tính năng Thử đồ AI (5-10 lượt/ngày) và ưu tiên may đo.' : 'Đang sử dụng gói cước hội viên.'}
                </p>
              )}
            </div>
          </div>

          {tier !== 'FREE' && (
            <div className="text-[13px] text-neutral-500 bg-[#FDFBF7] p-3.5 rounded-xl border border-[#EFE9E1] max-w-[320px]">
              <div className="flex items-center gap-1.5 font-bold text-brand-navy mb-0.5">
                <RefreshCw className="w-3.5 h-3.5 text-[#5D1C34]" /> Gia hạn cộng dồn
              </div>
              Khi gia hạn trước hạn cùng gói, 30 ngày mới sẽ nối tiếp vào ngày hết hạn hiện tại của bạn.
            </div>
          )}
        </div>
      )}

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
        {DEFAULT_PLANS.map((plan) => {
          const isCurrent = tier === plan.id;
          const isVip = plan.id === 'VIP';
          const isMember = plan.id === 'MEMBER';
          const isDowngradeDisabled = isMember && tier === 'VIP' && scheduled !== null;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl p-7 transition-all duration-300 ${plan.isPopular
                  ? 'bg-white border-2 border-[#5D1C34] shadow-xl shadow-[#5D1C34]/10 md:-translate-y-2'
                  : isVip
                    ? 'bg-gradient-to-b from-white to-[#FDFBF7] border border-[#A67D44]/40 shadow-lg'
                    : 'bg-white border border-neutral-200 shadow-sm'
                }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[12px] font-bold text-white shadow-sm ${plan.isPopular ? 'bg-[#5D1C34]' : 'bg-[#A67D44]'
                  }`}>
                  {plan.badge}
                </div>
              )}

              <div>
                {/* Title & Desc */}
                <div className="mb-6">
                  <h3 className="text-[22px] font-bold text-brand-navy mb-1 flex items-center gap-2">
                    {plan.name}
                    {isVip && <Crown className="w-5 h-5 text-[#A67D44]" />}
                  </h3>
                  <p className="text-[13px] text-neutral-500 min-h-[38px] leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-neutral-100">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[36px] font-bold text-brand-navy tracking-tight leading-none">
                      {plan.priceText}
                    </span>
                    <span className="text-body-sm text-neutral-500 font-medium">
                      {plan.periodText}
                    </span>
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-3.5 mb-8">
                  <div className="text-[12px] font-bold text-neutral-400 uppercase tracking-wider">
                    Quyền lợi gói cước:
                  </div>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-body-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${feat.highlight
                          ? 'bg-[#5D1C34] text-white'
                          : 'bg-neutral-100 text-neutral-600'
                        }`}>
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className={`${feat.highlight ? 'font-bold text-brand-navy' : 'text-neutral-600'}`}>
                        {feat.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <div>
                {plan.id === 'FREE' ? (
                  <button
                    disabled
                    className="w-full h-12 rounded-xl bg-neutral-100 text-neutral-400 font-bold text-body-sm cursor-not-allowed"
                  >
                    {isCurrent ? 'Gói hiện tại của bạn' : 'Mặc định khi đăng ký'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleInitiateUpgrade(plan.id as TargetTier)}
                    disabled={isCheckoutLoading || isDowngradeDisabled}
                    className={`w-full h-12 rounded-xl font-bold text-body-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${plan.isPopular
                        ? 'bg-[#5D1C34] hover:bg-[#5D1C34]/90 text-white shadow-[#5D1C34]/20'
                        : 'bg-gradient-to-r from-[#5D1C34] to-[#A67D44] hover:opacity-95 text-white shadow-[#A67D44]/20'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isCheckoutLoading ? (
                      'Đang xử lý...'
                    ) : isDowngradeDisabled ? (
                      'Đã lên lịch chuyển gói'
                    ) : isCurrent ? (
                      <>
                        <RefreshCw className="w-4 h-4" /> Gia hạn thêm 30 ngày
                      </>
                    ) : (
                      <>
                        {plan.ctaText} <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quota Comparison Table */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-200 shadow-sm">
        <h3 className="text-[20px] font-bold text-brand-navy mb-6">
          So sánh chi tiết hạn mức tính năng AI
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 font-semibold">
                <th className="py-3 px-4">Tính năng AI</th>
                <th className="py-3 px-4">Gói FREE</th>
                <th className="py-3 px-4 text-[#5D1C34] font-bold">Gói MEMBER (49k)</th>
                <th className="py-3 px-4 text-[#A67D44] font-bold">Gói VIP (99k)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              <tr>
                <td className="py-4 px-4 font-semibold text-brand-navy">Thử đồ AI (Try-on)</td>
                <td className="py-4 px-4 text-neutral-400 font-medium">0 (Không hỗ trợ)</td>
                <td className="py-4 px-4 text-brand-navy font-bold">5 lượt / ngày</td>
                <td className="py-4 px-4 text-[#5D1C34] font-bold">10 lượt / ngày</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-semibold text-brand-navy">Thử combo 2 món (Áo + Quần)</td>
                <td className="py-4 px-4 text-neutral-400">✕</td>
                <td className="py-4 px-4 text-neutral-700">✓ (Trừ 2 lượt)</td>
                <td className="py-4 px-4 text-neutral-700">✓ (Trừ 2 lượt)</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-semibold text-brand-navy">AI Stylist tư vấn may đo</td>
                <td className="py-4 px-4 text-neutral-600">3 lượt / ngày</td>
                <td className="py-4 px-4 text-neutral-700 font-medium">20 lượt / ngày</td>
                <td className="py-4 px-4 text-[#A67D44] font-bold">Không giới hạn (∞)</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-semibold text-brand-navy">Chatbot tư vấn phối đồ</td>
                <td className="py-4 px-4 text-neutral-600">50 tin / ngày</td>
                <td className="py-4 px-4 text-neutral-700">200 tin / ngày</td>
                <td className="py-4 px-4 text-[#A67D44] font-bold">Không giới hạn (∞)</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-semibold text-brand-navy">Tốc độ render Try-on</td>
                <td className="py-4 px-4 text-neutral-400">—</td>
                <td className="py-4 px-4 text-neutral-700">Tiêu chuẩn</td>
                <td className="py-4 px-4 text-[#A67D44] font-semibold">Ưu tiên cao (High Priority)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-[800px] mx-auto bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm">
        <h3 className="text-[20px] font-bold text-brand-navy mb-6 text-center">
          Câu hỏi thường gặp về gói cước
        </h3>
        <div className="space-y-6 text-body-sm text-neutral-600">
          <div>
            <h4 className="font-bold text-brand-navy text-[15px] mb-1">
              Lượt Thử đồ AI (Try-on) được tính như thế nào?
            </h4>
            <p className="leading-relaxed">
              Mỗi lần bạn gửi yêu cầu thử 1 món đơn sẽ trừ 1 lượt. Khi thử combo 2 món (Áo + Quần), hệ thống xử lý 2 giai đoạn và trừ 2 lượt quota. Hạn mức được tự động làm mới vào 00:00 (nửa đêm) mỗi ngày theo giờ Việt Nam.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-brand-navy text-[15px] mb-1">
              Chính sách gia hạn cộng dồn thời gian ra sao?
            </h4>
            <p className="leading-relaxed">
              Nếu gói Member của bạn còn 10 ngày và bạn mua gia hạn cùng gói Member, 30 ngày mới sẽ được nối tiếp vào sau ngày hết hạn cũ (tổng cộng 40 ngày).
            </p>
          </div>
          <div>
            <h4 className="font-bold text-brand-navy text-[15px] mb-1">
              Thanh toán qua SePay VietQR hoạt động thế nào?
            </h4>
            <p className="leading-relaxed">
              Bạn quét mã VietQR tự động qua ứng dụng ngân hàng hoặc ví điện tử bất kỳ. Sau khi chuyển khoản đúng nội dung, gói cước sẽ được kích hoạt tức thì trong vòng 5 giây.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
