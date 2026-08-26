'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Check, Sparkles, Crown, Zap, Shield, 
  HelpCircle, ArrowRight, Clock, AlertTriangle, 
  RefreshCw, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useCheckout, TargetTier } from '@/hooks/usePayments';
import { useUserProfile } from '@/hooks/useMeasurements';
import { toast } from 'sonner';
import Link from 'next/link';

interface PlanFeature {
  text: string;
  highlight?: boolean;
}

interface Plan {
  id: 'FREE' | 'MEMBER' | 'VIP';
  name: string;
  priceText: string;
  numericPrice: number;
  periodText: string;
  badge?: string;
  isPopular?: boolean;
  description: string;
  features: PlanFeature[];
  ctaText: string;
}

const PLANS: Plan[] = [
  {
    id: 'FREE',
    name: 'Miễn Phí',
    priceText: '0đ',
    numericPrice: 0,
    periodText: 'mãi mãi',
    description: 'Trải nghiệm cơ bản tư vấn phong cách cùng FashionAI',
    features: [
      { text: '0 lượt Thử đồ AI (Try-on)' },
      { text: '3 lượt AI Stylist / ngày' },
      { text: '50 tin nhắn Chatbot AI / ngày' },
      { text: 'Lưu trữ số đo cơ thể cá nhân' },
      { text: 'Đặt may đo Made-to-measure' },
    ],
    ctaText: 'Gói hiện tại',
  },
  {
    id: 'MEMBER',
    name: 'Hội Viên (Member)',
    priceText: '99.000đ',
    numericPrice: 99000,
    periodText: '/ 30 ngày',
    badge: 'Phổ biến nhất',
    isPopular: true,
    description: 'Dành cho khách hàng muốn trải nghiệm thử đồ AI và tư vấn phối đồ mỗi ngày',
    features: [
      { text: '5 lượt Thử đồ AI (Try-on) / ngày', highlight: true },
      { text: '3 lượt AI Stylist / ngày' },
      { text: '200 tin nhắn Chatbot AI / ngày', highlight: true },
      { text: 'Lưu trữ số đo & thử đồ đa trang phục' },
      { text: 'Tự động tính độ vừa vặn form dáng' },
      { text: 'Ưu tiên xếp lịch thợ may riêng' },
    ],
    ctaText: 'Nâng cấp Member',
  },
  {
    id: 'VIP',
    name: 'Khách Hàng VIP',
    priceText: '299.000đ',
    numericPrice: 299000,
    periodText: '/ 30 ngày',
    badge: 'Cao cấp nhất',
    description: 'Dành cho tín đồ thời trang cao cấp cần thử đồ không giới hạn và hỗ trợ stylist riêng',
    features: [
      { text: '10 lượt Thử đồ AI (Try-on) / ngày', highlight: true },
      { text: '3 lượt AI Stylist / ngày' },
      { text: 'Không giới hạn Chatbot AI (Unlimited)', highlight: true },
      { text: 'Xử lý Render AI siêu tốc độ' },
      { text: 'Tư vấn trực tiếp 1-1 với Stylist' },
      { text: 'Miễn phí chỉnh sửa số đo may đo 100%' },
    ],
    ctaText: 'Nâng cấp VIP',
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { profile } = useUserProfile();
  const { checkout, isLoading: isCheckoutLoading } = useCheckout();
  const [selectedTier, setSelectedTier] = useState<TargetTier>('MEMBER');

  // Determine current tier & expiration date
  const rawTier = (profile as any)?.tier || session?.user?.tier || 'FREE';
  const tier = rawTier.toUpperCase() as 'FREE' | 'MEMBER' | 'VIP';
  const rawExpiresAt = (profile as any)?.tierExpiresAt || (session?.user as any)?.tierExpiresAt;

  const expirationInfo = React.useMemo(() => {
    if (!rawExpiresAt || tier === 'FREE') return null;
    try {
      const expDate = new Date(rawExpiresAt);
      const now = new Date();
      const diffMs = expDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      
      return {
        formattedDate: expDate.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        daysRemaining: Math.max(0, diffDays),
        isExpired: diffMs <= 0,
        isExpiringSoon: diffDays <= 3 && diffMs > 0,
      };
    } catch {
      return null;
    }
  }, [rawExpiresAt, tier]);

  const handleUpgrade = async (targetTier: TargetTier) => {
    if (status !== 'authenticated') {
      toast.info('Vui lòng đăng nhập để nâng cấp gói!');
      router.push('/login?callbackUrl=/subscription');
      return;
    }

    try {
      toast.loading('Đang khởi tạo cổng thanh toán...', { id: 'checkout' });
      const result = await checkout({ targetTier, provider: 'SEPAY' });
      toast.dismiss('checkout');

      if (result.checkoutUrl) {
        // Case 1: Backend returned formAction and formFields for POST (SePay)
        if (result.extra?.formAction && result.extra?.formFields) {
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = result.extra.formAction;
          Object.entries(result.extra.formFields).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = String(value);
            form.appendChild(input);
          });
          document.body.appendChild(form);
          form.submit();
          return;
        }

        // Case 2: SePay URL with query params requiring POST
        try {
          const parsedUrl = new URL(result.checkoutUrl, window.location.origin);
          if (
            (parsedUrl.hostname.includes('sepay.vn') || parsedUrl.pathname.includes('/checkout/init')) &&
            parsedUrl.searchParams.size > 0
          ) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `${parsedUrl.origin}${parsedUrl.pathname}`;
            parsedUrl.searchParams.forEach((value, key) => {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = value;
              form.appendChild(input);
            });
            document.body.appendChild(form);
            form.submit();
            return;
          }
        } catch (urlErr) {
          console.warn('Could not parse checkoutUrl:', urlErr);
        }

        // Case 3: Direct redirect
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error('Không nhận được link thanh toán từ hệ thống');
      }
    } catch (err: any) {
      toast.dismiss('checkout');
      const msg = err?.response?.data?.message || err?.message || 'Không thể tạo đơn thanh toán.';
      toast.error(`Lỗi: ${Array.isArray(msg) ? msg[0] : msg}`);
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-12 md:py-16 text-neutral-800">
      <div className="max-w-[1200px] w-full mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center max-w-[700px] mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5D1C34]/10 text-[#5D1C34] text-[13px] font-bold mb-4">
            <Crown className="w-4 h-4" /> Bảng giá & Gói cước Hội viên
          </div>
          <h1 className="text-[32px] md:text-[42px] font-bold text-brand-navy tracking-tight leading-tight mb-4">
            Trải nghiệm thời trang chuẩn may đo cùng AI
          </h1>
          <p className="text-body-md text-neutral-600 leading-relaxed">
            Mở khóa tính năng Thử đồ AI ảo độc quyền, tư vấn phong cách theo số đo cơ thể và nhận may đo chính xác từng centimet.
          </p>
        </div>

        {/* Current Tier Status Banner */}
        {status === 'authenticated' && (
          <div className="mb-12 p-6 md:p-8 bg-white rounded-3xl border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 shadow-sm ${
                tier === 'VIP' 
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
                    <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-bold ${
                      expirationInfo.isExpiringSoon 
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
                    {tier === 'FREE' ? 'Nâng cấp ngay để mở khóa tính năng Thử đồ AI (Try-on) và ưu tiên may đo.' : 'Đang sử dụng gói cước hội viên.'}
                  </p>
                )}
              </div>
            </div>

            {tier !== 'FREE' && (
              <div className="text-[13px] text-neutral-500 bg-[#FDFBF7] p-3.5 rounded-xl border border-[#EFE9E1] max-w-[320px]">
                <div className="flex items-center gap-1.5 font-bold text-brand-navy mb-0.5">
                  <RefreshCw className="w-3.5 h-3.5 text-[#5D1C34]" /> Quy tắc gia hạn cộng dồn
                </div>
                Khi gia hạn trước hạn, hệ thống sẽ tự động cộng dồn 30 ngày vào ngày hết hạn hiện tại của bạn.
              </div>
            )}
          </div>
        )}

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch mb-16">
          {PLANS.map((plan) => {
            const isCurrent = tier === plan.id;
            const isVip = plan.id === 'VIP';
            const isMember = plan.id === 'MEMBER';

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl p-7 transition-all duration-300 ${
                  plan.isPopular
                    ? 'bg-white border-2 border-[#5D1C34] shadow-xl shadow-[#5D1C34]/10 md:-translate-y-2'
                    : isVip
                    ? 'bg-gradient-to-b from-white to-[#FDFBF7] border border-[#A67D44]/40 shadow-lg'
                    : 'bg-white border border-neutral-200 shadow-sm'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[12px] font-bold text-white shadow-sm ${
                    isPopularBadge(plan.badge) ? 'bg-[#5D1C34]' : 'bg-[#A67D44]'
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
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          feat.highlight
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
                      onClick={() => handleUpgrade(plan.id as TargetTier)}
                      disabled={isCheckoutLoading}
                      className={`w-full h-12 rounded-xl font-bold text-body-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                        plan.isPopular
                          ? 'bg-[#5D1C34] hover:bg-[#5D1C34]/90 text-white shadow-[#5D1C34]/20'
                          : 'bg-gradient-to-r from-[#5D1C34] to-[#A67D44] hover:opacity-95 text-white shadow-[#A67D44]/20'
                      } disabled:opacity-50`}
                    >
                      {isCheckoutLoading ? (
                        'Đang xử lý...'
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

        {/* FAQs */}
        <div className="max-w-[800px] mx-auto bg-white rounded-3xl p-8 md:p-10 border border-neutral-200 shadow-sm">
          <h3 className="text-[22px] font-bold text-brand-navy mb-6 text-center">
            Câu hỏi thường gặp về gói cước
          </h3>
          <div className="space-y-6 text-body-sm text-neutral-600">
            <div>
              <h4 className="font-bold text-brand-navy text-[15px] mb-1">
                Lượt Thử đồ AI (Try-on) được tính như thế nào?
              </h4>
              <p className="leading-relaxed">
                Mỗi lần bạn gửi yêu cầu phối trang phục lên avatar AI sẽ trừ 1 lượt quota Try-on. Quota được tự động làm mới vào 00:00 (nửa đêm) mỗi ngày theo giờ Việt Nam.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-brand-navy text-[15px] mb-1">
                Nếu tôi gia hạn khi gói cũ vẫn còn ngày thì sao?
              </h4>
              <p className="leading-relaxed">
                Hệ thống áp dụng chính sách cộng dồn thời hạn. Nếu gói Member của bạn còn 10 ngày và bạn mua thêm gói Member 30 ngày, thời hạn mới sẽ là 40 ngày kể từ hôm nay.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-brand-navy text-[15px] mb-1">
                Phương thức thanh toán nào được hỗ trợ?
              </h4>
              <p className="leading-relaxed">
                FashionAI hỗ trợ thanh toán tự động qua cổng SePay & VietQR. Bạn chỉ cần quét mã QR qua ứng dụng ngân hàng hoặc ví điện tử bất kỳ, gói cước sẽ được kích hoạt ngay lập tức trong vòng 5 giây.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function isPopularBadge(badge?: string) {
  return badge === 'Phổ biến nhất';
}
