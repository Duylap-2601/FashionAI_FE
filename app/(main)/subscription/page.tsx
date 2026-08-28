'use client';

import React, { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Check, Sparkles, Crown, Zap, Shield, 
  HelpCircle, ArrowRight, Clock, AlertTriangle, 
  RefreshCw, CheckCircle2, ChevronRight, History as HistoryIcon,
  Calendar, Layers, ShieldCheck, CreditCard, AlertCircle, X, ChevronLeft
} from 'lucide-react';
import { useCheckout, TargetTier } from '@/hooks/usePayments';
import { useUserProfile } from '@/hooks/useMeasurements';
import { 
  usePlans, 
  useMySubscription, 
  useSubscriptionHistory, 
  useCancelSubscription, 
  useResumeSubscription,
  SubscriptionTier,
  SubscriptionStatus
} from '@/hooks/useSubscription';
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

const DEFAULT_PLANS: Plan[] = [
  {
    id: 'FREE',
    name: 'Miễn Phí',
    priceText: '0đ',
    numericPrice: 0,
    periodText: 'mãi mãi',
    description: 'Trải nghiệm cơ bản tư vấn phong cách cùng FashionAI',
    features: [
      { text: '0 lượt Thử đồ AI (Try-on cấm)' },
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
    priceText: '49.000đ',
    numericPrice: 49000,
    periodText: '/ 30 ngày',
    badge: 'Phổ biến nhất',
    isPopular: true,
    description: 'Dành cho khách hàng muốn trải nghiệm thử đồ AI và tư vấn phối đồ mỗi ngày',
    features: [
      { text: '5 lượt Thử đồ AI (Try-on) / ngày', highlight: true },
      { text: '20 lượt AI Stylist / ngày', highlight: true },
      { text: '200 tin nhắn Chatbot AI / ngày', highlight: true },
      { text: 'Hỗ trợ thử combo 2 món (Áo + Quần)' },
      { text: 'Tự động tính độ vừa vặn form dáng' },
      { text: 'Ưu tiên xếp lịch thợ may riêng' },
    ],
    ctaText: 'Nâng cấp Member',
  },
  {
    id: 'VIP',
    name: 'Khách Hàng VIP',
    priceText: '99.000đ',
    numericPrice: 99000,
    periodText: '/ 30 ngày',
    badge: 'Cao cấp nhất',
    description: 'Dành cho tín đồ thời trang cao cấp cần thử đồ nhiều lần và hỗ trợ stylist không giới hạn',
    features: [
      { text: '10 lượt Thử đồ AI (Try-on) / ngày', highlight: true },
      { text: 'Không giới hạn AI Stylist (Unlimited)', highlight: true },
      { text: 'Không giới hạn Chatbot AI (Unlimited)', highlight: true },
      { text: 'Hỗ trợ thử combo 2 món (Áo + Quần)' },
      { text: 'Xử lý Render AI siêu tốc độ' },
      { text: 'Tư vấn trực tiếp 1-1 với Stylist' },
    ],
    ctaText: 'Nâng cấp VIP',
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { profile } = useUserProfile();
  const { checkout, isLoading: isCheckoutLoading } = useCheckout();

  // Subscription hooks
  const { plans: apiPlans } = usePlans();
  const { current, scheduled, tier: subTier, tierExpiresAt, isFree, refetch: refetchSub } = useMySubscription();
  const [historyPage, setHistoryPage] = useState(1);
  const { history, meta: historyMeta, isLoading: isHistoryLoading } = useSubscriptionHistory(historyPage, 10);
  const { cancelSubscription, isCancelling } = useCancelSubscription();
  const { resumeSubscription, isResuming } = useResumeSubscription();

  const [activeTab, setActiveTab] = useState<'plans' | 'my-sub' | 'history'>('plans');
  const [upgradeConfirmTier, setUpgradeConfirmTier] = useState<TargetTier | null>(null);

  // Determine current tier & expiration date
  const rawTier = subTier || (profile as any)?.tier || session?.user?.tier || 'FREE';
  const tier = rawTier.toUpperCase() as 'FREE' | 'MEMBER' | 'VIP';
  const rawExpiresAt = tierExpiresAt || (profile as any)?.tierExpiresAt || (session?.user as any)?.tierExpiresAt;

  const expirationInfo = useMemo(() => {
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
        daysRemaining: current?.daysRemaining ?? Math.max(0, diffDays),
        isExpired: diffMs <= 0,
        isExpiringSoon: diffDays <= 3 && diffMs > 0,
      };
    } catch {
      return null;
    }
  }, [rawExpiresAt, tier, current]);

  const handleInitiateUpgrade = (targetTier: TargetTier) => {
    if (status !== 'authenticated') {
      toast.info('Vui lòng đăng nhập để nâng cấp gói!');
      router.push('/login?callbackUrl=/subscription');
      return;
    }

    // If upgrading from MEMBER to VIP with remaining days > 0, warn user
    if (tier === 'MEMBER' && targetTier === 'VIP' && expirationInfo && expirationInfo.daysRemaining > 1) {
      setUpgradeConfirmTier(targetTier);
      return;
    }

    proceedCheckout(targetTier);
  };

  const proceedCheckout = async (targetTier: TargetTier) => {
    setUpgradeConfirmTier(null);
    try {
      toast.loading('Đang khởi tạo cổng thanh toán...', { id: 'checkout' });
      const result = await checkout({ targetTier, provider: 'SEPAY' });
      toast.dismiss('checkout');

      if (result.checkoutUrl) {
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

  const handleToggleAutoRenew = async () => {
    if (!current) return;
    try {
      if (current.autoRenew) {
        await cancelSubscription();
        toast.success('Đã tắt nhắc tự động gia hạn. Bạn vẫn dùng gói đến hết ngày hết hạn.');
      } else {
        await resumeSubscription();
        toast.success('Đã bật lại nhắc tự động gia hạn.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể thay đổi trạng thái gia hạn.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const getStatusBadge = (subStatus: SubscriptionStatus) => {
    switch (subStatus) {
      case 'ACTIVE':
        return <span className="px-2.5 py-1 rounded-full text-[12px] font-bold bg-green-100 text-green-800">Đang hoạt động</span>;
      case 'SCHEDULED':
        return <span className="px-2.5 py-1 rounded-full text-[12px] font-bold bg-blue-100 text-blue-800">Chờ kích hoạt</span>;
      case 'EXPIRED':
        return <span className="px-2.5 py-1 rounded-full text-[12px] font-bold bg-neutral-100 text-neutral-600">Đã hết hạn</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[12px] font-bold bg-amber-100 text-amber-800">Đã hủy</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[12px] font-bold bg-neutral-100 text-neutral-600">{subStatus}</span>;
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 md:py-14 text-neutral-800">
      <div className="max-w-[1200px] w-full mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="text-center max-w-[720px] mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5D1C34]/10 text-[#5D1C34] text-[13px] font-bold mb-4">
            <Crown className="w-4 h-4" /> Dịch vụ Hội viên FashionAI
          </div>
          <h1 className="text-[32px] md:text-[42px] font-bold text-brand-navy tracking-tight leading-tight mb-4">
            Trải nghiệm thời trang may đo chuẩn xác cùng AI
          </h1>
          <p className="text-body-md text-neutral-600 leading-relaxed">
            Mở khóa tính năng Thử đồ AI ảo độc quyền, tư vấn phối trang phục theo số đo cơ thể và nhận may đo chính xác từng centimet.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 bg-white rounded-2xl border border-neutral-200 shadow-sm gap-1">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-5 py-2.5 rounded-xl font-bold text-[14px] transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'plans'
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'text-neutral-600 hover:text-brand-navy hover:bg-neutral-50'
              }`}
            >
              <Zap className="w-4 h-4" /> Bảng giá gói cước
            </button>
            {status === 'authenticated' && (
              <>
                <button
                  onClick={() => setActiveTab('my-sub')}
                  className={`px-5 py-2.5 rounded-xl font-bold text-[14px] transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'my-sub'
                      ? 'bg-brand-navy text-white shadow-sm'
                      : 'text-neutral-600 hover:text-brand-navy hover:bg-neutral-50'
                  }`}
                >
                  <Crown className="w-4 h-4" /> Gói của tôi
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-5 py-2.5 rounded-xl font-bold text-[14px] transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'history'
                      ? 'bg-brand-navy text-white shadow-sm'
                      : 'text-neutral-600 hover:text-brand-navy hover:bg-neutral-50'
                  }`}
                >
                  <HistoryIcon className="w-4 h-4" /> Lịch sử đăng ký
                </button>
              </>
            )}
          </div>
        </div>

        {/* ─────────────────── TAB 1: BẢNG GIÁ ─────────────────── */}
        {activeTab === 'plans' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Current Tier Quick Summary Banner */}
            {status === 'authenticated' && (
              <div className="p-6 md:p-8 bg-white rounded-3xl border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
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
                        plan.isPopular ? 'bg-[#5D1C34]' : 'bg-[#A67D44]'
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
                          onClick={() => handleInitiateUpgrade(plan.id as TargetTier)}
                          disabled={isCheckoutLoading || isDowngradeDisabled}
                          className={`w-full h-12 rounded-xl font-bold text-body-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                            plan.isPopular
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
        )}

        {/* ─────────────────── TAB 2: GÓI CỦA TÔI ─────────────────── */}
        {activeTab === 'my-sub' && (
          <div className="max-w-[840px] mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Main Current Subscription Card */}
            <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-sm ${
                    tier === 'VIP' 
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
                    className={`px-4 py-2.5 rounded-xl font-bold text-body-sm transition-all shrink-0 cursor-pointer ${
                      current.autoRenew
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
            <div className="p-6 bg-[#FDFBF7] rounded-3xl border border-[#EFE9E1] text-body-sm text-neutral-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-brand-navy">
                <ShieldCheck className="w-5 h-5 text-[#5D1C34]" /> Bảo mật & Minh bạch thanh toán
              </div>
              <p className="leading-relaxed">
                FashionAI sử dụng cổng VietQR SePay theo từng lần thanh toán. Hệ thống không lưu trữ thông tin thẻ hay tự động trừ tiền trong tài khoản của bạn. &quot;Tự động gia hạn&quot; đóng vai trò gửi lời nhắc tiện lợi để bạn không bị gián đoạn trải nghiệm thử đồ AI.
              </p>
            </div>
          </div>
        )}

        {/* ─────────────────── TAB 3: LỊCH SỬ ĐĂNG KÝ ─────────────────── */}
        {activeTab === 'history' && (
          <div className="max-w-[960px] mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="text-heading-h3 font-bold text-brand-navy">Lịch sử giao dịch gói</h3>
                  <p className="text-body-sm text-neutral-500 mt-0.5">Danh sách các gói cước bạn đã đăng ký</p>
                </div>
              </div>

              {isHistoryLoading ? (
                <div className="p-12 text-center text-neutral-500">Đang tải lịch sử đăng ký...</div>
              ) : history.length === 0 ? (
                <div className="p-12 text-center text-neutral-500">
                  Bạn chưa có lịch sử đăng ký gói trả phí nào.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-body-sm border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                        <th className="py-3.5 px-6">Mã đơn</th>
                        <th className="py-3.5 px-6">Gói cước</th>
                        <th className="py-3.5 px-6">Thời hạn</th>
                        <th className="py-3.5 px-6">Số tiền</th>
                        <th className="py-3.5 px-6">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {history.map((item) => (
                        <tr key={item.id} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="py-4 px-6 font-mono text-xs font-semibold text-neutral-700">
                            #{item.order?.orderCode || item.id.slice(0, 8)}
                          </td>
                          <td className="py-4 px-6 font-bold text-brand-navy">
                            Gói {item.tier}
                          </td>
                          <td className="py-4 px-6 text-neutral-600 text-[13px]">
                            {formatDate(item.startsAt)} &rarr; {formatDate(item.expiresAt)}
                          </td>
                          <td className="py-4 px-6 font-bold text-brand-navy">
                            {item.order?.amount ? `${item.order.amount.toLocaleString('vi-VN')}đ` : '—'}
                          </td>
                          <td className="py-4 px-6">
                            {getStatusBadge(item.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {historyMeta && historyMeta.totalPages > 1 && (
                <div className="p-4 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-body-sm text-neutral-500">
                    Trang {historyMeta.page} / {historyMeta.totalPages} (Tổng {historyMeta.total} đơn)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                      disabled={historyPage === 1}
                      className="px-3 py-1.5 border border-neutral-200 rounded-lg text-body-sm font-semibold disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setHistoryPage(p => Math.min(historyMeta.totalPages, p + 1))}
                      disabled={historyPage === historyMeta.totalPages}
                      className="px-3 py-1.5 border border-neutral-200 rounded-lg text-body-sm font-semibold disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─────────────────── UPGRADE CONFIRMATION MODAL ─────────────────── */}
        {upgradeConfirmTier && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setUpgradeConfirmTier(null)}
            />
            <div className="relative w-full max-w-[460px] bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-neutral-100 z-10 animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setUpgradeConfirmTier(null)}
                className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-[20px] font-bold text-brand-navy mb-2">
                Xác nhận nâng cấp gói {upgradeConfirmTier}
              </h3>
              <p className="text-body-sm text-neutral-600 mb-6 leading-relaxed">
                Bạn hiện còn <strong>{expirationInfo?.daysRemaining} ngày</strong> của gói {tier}. Khi nâng cấp lên <strong>{upgradeConfirmTier}</strong>, gói mới sẽ có hiệu lực ngay lập tức và thời gian còn lại của gói {tier} sẽ không được cộng dồn.
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => proceedCheckout(upgradeConfirmTier)}
                  className="w-full h-12 bg-gradient-to-r from-[#5D1C34] to-[#A67D44] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-95 shadow-md shadow-[#5D1C34]/20 cursor-pointer"
                >
                  Tiến hành nâng cấp ngay <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setUpgradeConfirmTier(null)}
                  className="w-full py-2.5 text-center text-body-sm text-neutral-500 hover:text-neutral-800 font-medium"
                >
                  Để sau
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
