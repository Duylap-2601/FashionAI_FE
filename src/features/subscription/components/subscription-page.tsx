'use client';

import { CurrentSubscription } from '@/features/subscription/components/current-subscription';
import { SubscriptionHistory } from '@/features/subscription/components/subscription-history';
import { SubscriptionPlans } from '@/features/subscription/components/subscription-plans';
import type { SubscriptionErrorBody } from '@/features/subscription/types/subscription-page';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCheckout } from '@/features/payments/hooks/usePayments';
import type { TargetTier } from '@/features/payments/types/payments';
import { useUserProfile } from '@/features/profile/hooks/use-profile';
import { useCancelSubscription, useMySubscription, usePlans, useResumeSubscription, useSubscriptionHistory } from '@/features/subscription/hooks/useSubscription';
import type { SubscriptionStatus } from '@/features/subscription/types/subscription';
import {
  AlertTriangle,
  ArrowRight,
  Crown,
  History as HistoryIcon,
  X,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

export default function SubscriptionPage() {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
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
  const rawTier = subTier || profile?.tier || user?.tier || 'FREE';
  const tier = rawTier.toUpperCase() as 'FREE' | 'MEMBER' | 'VIP';
  const rawExpiresAt = tierExpiresAt || profile?.tierExpiresAt || user?.tierExpiresAt;

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
    } catch (err: unknown) {
      toast.dismiss('checkout');
      const msg = readSubscriptionErrorMessage(err) || 'Không thể tạo đơn thanh toán.';
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
    } catch (err: unknown) {
      const msg = readSubscriptionErrorMessage(err) || 'Không thể thay đổi trạng thái gia hạn.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  function readSubscriptionErrorMessage(error: unknown): SubscriptionErrorBody['message'] | undefined {
    if (!(error instanceof Error)) return undefined;
    if (!('response' in error)) return error.message;
    const response = error.response as { data?: unknown };
    const data = response.data;
    if (!data || typeof data !== 'object') return error.message;
    const message = (data as Record<string, unknown>).message;
    return typeof message === 'string' || Array.isArray(message) ? message as string | string[] : error.message;
  }

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
              className={`px-5 py-2.5 rounded-xl font-bold text-[14px] transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'plans'
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
                  className={`px-5 py-2.5 rounded-xl font-bold text-[14px] transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'my-sub'
                      ? 'bg-brand-navy text-white shadow-sm'
                      : 'text-neutral-600 hover:text-brand-navy hover:bg-neutral-50'
                    }`}
                >
                  <Crown className="w-4 h-4" /> Gói của tôi
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-5 py-2.5 rounded-xl font-bold text-[14px] transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'history'
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
          <SubscriptionPlans
            status={status}
            tier={tier}
            expirationInfo={expirationInfo}
            scheduled={scheduled}
            handleInitiateUpgrade={handleInitiateUpgrade}
            isCheckoutLoading={isCheckoutLoading}
          />
        )}

        {/* ─────────────────── TAB 2: GÓI CỦA TÔI ─────────────────── */}
        {activeTab === 'my-sub' && (
          <CurrentSubscription
            tier={tier}
            current={current}
            getStatusBadge={getStatusBadge}
            setActiveTab={setActiveTab}
            handleInitiateUpgrade={handleInitiateUpgrade}
            formatDate={formatDate}
            rawExpiresAt={rawExpiresAt}
            expirationInfo={expirationInfo}
            scheduled={scheduled}
            handleToggleAutoRenew={handleToggleAutoRenew}
            isCancelling={isCancelling}
            isResuming={isResuming}
          />
        )}

        {/* ─────────────────── TAB 3: LỊCH SỬ ĐĂNG KÝ ─────────────────── */}
        {activeTab === 'history' && (
          <SubscriptionHistory
            isHistoryLoading={isHistoryLoading}
            history={history}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
            historyMeta={historyMeta}
            setHistoryPage={setHistoryPage}
            historyPage={historyPage}
          />
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
