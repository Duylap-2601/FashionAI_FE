'use client';

import { CurrentSubscription } from '@/features/subscription/components/current-subscription';
import { SubscriptionHistory } from '@/features/subscription/components/subscription-history';
import { SubscriptionPlans } from '@/features/subscription/components/subscription-plans';
import type { SubscriptionErrorBody } from '@/features/subscription/types/subscription-page';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCheckout } from '@/features/payments/hooks/usePayments';
import type { CheckoutResponse, ProrationBreakdown, TargetTier } from '@/features/payments/types/payments';
import { useUserProfile } from '@/features/profile/hooks/use-profile';
import {
  useCancelScheduledSubscription,
  useCancelSubscription,
  useMySubscription,
  usePlans,
  useResumeSubscription,
  useSubscriptionHistory,
} from '@/features/subscription/hooks/useSubscription';
import type { SubscriptionStatus } from '@/features/subscription/types/subscription';
import { AccountShell } from '@/features/profile/components/account-shell';
import {
  AccountConfirmDialog,
  AccountDialog,
  accountButtonClassName,
  accountFocusRing,
  accountLabelClassName,
} from '@/features/profile/components/account-ui';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function SubscriptionPage() {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const { profile } = useUserProfile();
  const { checkout, isLoading: isCheckoutLoading } = useCheckout();

  // Subscription hooks
  const { plans: apiPlans } = usePlans();
  const { current, scheduled, tier: subTier, tierExpiresAt, refetch: refetchSub } = useMySubscription();
  const [historyPage, setHistoryPage] = useState(1);
  const { history, meta: historyMeta, isLoading: isHistoryLoading } = useSubscriptionHistory(historyPage, 10);
  const { cancelSubscription, isCancelling } = useCancelSubscription();
  const { resumeSubscription, isResuming } = useResumeSubscription();
  const { cancelScheduledSubscription, isCancellingScheduled } = useCancelScheduledSubscription();

  const [activeTab, setActiveTab] = useState<'plans' | 'my-sub' | 'history'>('plans');
  const [upgradeConfirmTier, setUpgradeConfirmTier] = useState<TargetTier | null>(null);

  // Proration & Conflict modals state
  const pendingCheckoutResultRef = useRef<CheckoutResponse | null>(null);
  const [prorationBreakdown, setProrationBreakdown] = useState<ProrationBreakdown | null>(null);
  const [pendingTargetTier, setPendingTargetTier] = useState<TargetTier | null>(null);
  const [scheduledConflictTier, setScheduledConflictTier] = useState<string | null>(null);
  const [cancelScheduledConfirmOpen, setCancelScheduledConfirmOpen] = useState(false);

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

  const redirectToCheckout = (result: CheckoutResponse) => {
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
  };

  const proceedCheckout = async (targetTier: TargetTier) => {
    setUpgradeConfirmTier(null);
    try {
      toast.loading('Đang khởi tạo cổng thanh toán...', { id: 'checkout' });
      const result = await checkout({ targetTier, provider: 'MOMO' });
      toast.dismiss('checkout');

      if (result.proration != null) {
        pendingCheckoutResultRef.current = result;
        setProrationBreakdown(result.proration);
        setPendingTargetTier(targetTier);
        return;
      }

      redirectToCheckout(result);
    } catch (err: unknown) {
      toast.dismiss('checkout');
      if (isAxios409(err)) {
        const conflictTier = getConflictTierFrom409(err) || scheduled?.tier || 'đã đặt trước';
        setScheduledConflictTier(conflictTier);
        return;
      }
      const msg = readSubscriptionErrorMessage(err) || 'Không thể tạo đơn thanh toán.';
      toast.error(`Lỗi: ${Array.isArray(msg) ? msg[0] : msg}`);
    }
  };

  const handleCancelConflictScheduled = async () => {
    try {
      toast.loading('Đang hủy lịch hẹn...', { id: 'cancel-sched' });
      await cancelScheduledSubscription();
      toast.dismiss('cancel-sched');
      toast.success('Đã hủy lịch hẹn. Bạn có thể chọn mua gói mới.');
      setScheduledConflictTier(null);
      refetchSub();
    } catch (err: unknown) {
      toast.dismiss('cancel-sched');
      if (isAxios404(err)) {
        toast.error('Không tìm thấy lịch hẹn nào để hủy.');
        setScheduledConflictTier(null);
        return;
      }
      const msg = readSubscriptionErrorMessage(err) || 'Không thể hủy lịch hẹn.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const handleConfirmCancelScheduled = async () => {
    try {
      setCancelScheduledConfirmOpen(false);
      toast.loading('Đang hủy lịch chuyển gói...', { id: 'cancel-sched' });
      await cancelScheduledSubscription();
      toast.dismiss('cancel-sched');
      toast.success('Đã hủy lịch chuyển gói. Gói hiện tại vẫn tiếp tục đến ngày hết hạn.');
      refetchSub();
    } catch (err: unknown) {
      toast.dismiss('cancel-sched');
      if (isAxios404(err)) {
        toast.error('Không tìm thấy lịch hẹn nào để hủy.');
        return;
      }
      const msg = readSubscriptionErrorMessage(err) || 'Không thể hủy lịch chuyển gói.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
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

  function isAxios409(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      (error as { response?: { status?: number } }).response?.status === 409
    );
  }

  function isAxios404(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      (error as { response?: { status?: number } }).response?.status === 404
    );
  }

  function getConflictTierFrom409(error: unknown): string | null {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const res = (error as { response?: { data?: unknown } }).response;
      if (res?.data && typeof res.data === 'object') {
        const data = res.data as Record<string, unknown>;
        if (typeof data.scheduledTier === 'string') return data.scheduledTier;
        if (typeof data.tier === 'string') return data.tier;
        if (typeof data.targetTier === 'string') return data.targetTier;
      }
    }
    return null;
  }

  const getStatusBadge = (subStatus: SubscriptionStatus) => {
    const meta: Record<string, { label: string; dot: string; text: string }> = {
      ACTIVE: { label: 'Đang hoạt động', dot: 'bg-landing-sage', text: 'text-landing-sage-ink' },
      SCHEDULED: { label: 'Chờ kích hoạt', dot: 'bg-landing-brass', text: 'text-landing-brass-ink' },
      EXPIRED: { label: 'Đã hết hạn', dot: 'bg-landing-taupe', text: 'text-landing-muted' },
      CANCELLED: { label: 'Đã huỷ', dot: 'bg-landing-taupe', text: 'text-landing-muted' },
    };
    const item = meta[subStatus] ?? { label: subStatus, dot: 'bg-landing-taupe', text: 'text-landing-muted' };
    return (
      <span className={`inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${item.text}`}>
        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
        {item.label}
      </span>
    );
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'Chưa có';
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

  const netAmount = prorationBreakdown ? Math.max(0, Math.round(prorationBreakdown.net / 1000) * 1000) : 0;
  const tabs: { id: typeof activeTab; label: string }[] = status === 'authenticated'
    ? [{ id: 'plans', label: 'Bảng giá' }, { id: 'my-sub', label: 'Gói của tôi' }, { id: 'history', label: 'Lịch sử thanh toán' }]
    : [{ id: 'plans', label: 'Bảng giá' }];

  const content = (
    <>
      {tabs.length > 1 ? (
        <div role="tablist" aria-label="Gói thành viên" className="no-scrollbar mb-8 flex gap-6 overflow-x-auto border-b border-landing-line">
          {tabs.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.id)}
                className={`relative h-11 shrink-0 whitespace-nowrap text-sm transition-colors ${accountFocusRing} ${selected ? 'font-medium text-landing-oxblood after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-landing-oxblood' : 'text-landing-obsidian/70 hover:text-landing-oxblood'}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {activeTab === 'plans' && (
        <SubscriptionPlans
          status={status}
          tier={tier}
          expirationInfo={expirationInfo}
          scheduled={scheduled}
          handleInitiateUpgrade={handleInitiateUpgrade}
          isCheckoutLoading={isCheckoutLoading}
          apiPlans={apiPlans}
        />
      )}

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
          handleCancelScheduled={() => setCancelScheduledConfirmOpen(true)}
          isCancellingScheduled={isCancellingScheduled}
        />
      )}

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

      <AccountDialog
        open={upgradeConfirmTier !== null}
        onOpenChange={(open) => { if (!open) setUpgradeConfirmTier(null); }}
        eyebrow="Nâng cấp gói"
        title={`Chuyển lên ${upgradeConfirmTier ?? ''}`}
        description={`Gói ${tier} của bạn còn ${expirationInfo?.daysRemaining ?? 0} ngày. Giá trị còn lại được trừ vào tiền gói mới; bạn sẽ thấy bảng tính chi tiết trước khi thanh toán.`}
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => setUpgradeConfirmTier(null)} className={accountButtonClassName('outline')}>Để sau</button>
          <button type="button" onClick={() => upgradeConfirmTier && proceedCheckout(upgradeConfirmTier)} className={accountButtonClassName('primary')}>
            Tiếp tục <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </AccountDialog>

      <AccountDialog
        open={prorationBreakdown !== null}
        onOpenChange={(open) => { if (!open) setProrationBreakdown(null); }}
        eyebrow="Nâng cấp gói"
        title={`Thanh toán gói ${pendingTargetTier || prorationBreakdown?.newTier || ''}`}
        description={prorationBreakdown ? `Giá trị còn lại của gói ${prorationBreakdown.oldTier} (${prorationBreakdown.remainingDays} ngày) được trừ vào tiền gói mới.` : undefined}
      >
        {prorationBreakdown ? (
          <>
            <dl className="space-y-2.5 border-y border-landing-line/70 py-4 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-landing-muted">Gói hiện tại</dt><dd>{prorationBreakdown.oldTier}, còn <span className="font-mono">{prorationBreakdown.remainingDays}</span> ngày</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-landing-muted">Giá gói {pendingTargetTier || prorationBreakdown.newTier}</dt><dd className="font-mono">{prorationBreakdown.debit.toLocaleString('vi-VN')}đ</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-landing-muted">Trừ gói cũ</dt><dd className="font-mono text-landing-sage-ink">−{prorationBreakdown.credit.toLocaleString('vi-VN')}đ</dd></div>
              <div className="flex items-baseline justify-between gap-4 border-t border-landing-line/70 pt-3"><dt className="font-medium">Cần thanh toán</dt><dd className="font-mono text-xl text-landing-oxblood">{netAmount.toLocaleString('vi-VN')}đ</dd></div>
            </dl>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setProrationBreakdown(null)} className={accountButtonClassName('outline')}>Để sau</button>
              <button
                type="button"
                onClick={() => {
                  if (pendingCheckoutResultRef.current) {
                    redirectToCheckout(pendingCheckoutResultRef.current);
                  }
                  setProrationBreakdown(null);
                }}
                className={accountButtonClassName('primary')}
              >
                Thanh toán {netAmount.toLocaleString('vi-VN')}đ
              </button>
            </div>
          </>
        ) : null}
      </AccountDialog>

      <AccountDialog
        open={scheduledConflictTier !== null}
        onOpenChange={(open) => { if (!open) setScheduledConflictTier(null); }}
        eyebrow="Gói thành viên"
        title="Đang có lịch chuyển gói"
        description={`Bạn đã lên lịch chuyển sang gói ${scheduledConflictTier ?? ''}. Để mua gói mới ngay, hãy huỷ lịch đó trước.`}
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => setScheduledConflictTier(null)} className={accountButtonClassName('outline')}>Để sau</button>
          <button type="button" onClick={handleCancelConflictScheduled} disabled={isCancellingScheduled} className={accountButtonClassName('danger')}>
            {isCancellingScheduled ? 'Đang huỷ' : 'Huỷ lịch chuyển gói'}
          </button>
        </div>
      </AccountDialog>

      <AccountConfirmDialog
        open={cancelScheduledConfirmOpen}
        onOpenChange={setCancelScheduledConfirmOpen}
        title={`Huỷ lịch chuyển gói ${scheduled?.tier ?? ''}?`}
        description="Chỉ huỷ lịch, số tiền đã thanh toán không được hoàn lại. Gói hiện tại vẫn dùng đến ngày hết hạn."
        confirmLabel="Huỷ lịch"
        isPending={isCancellingScheduled}
        onConfirm={handleConfirmCancelScheduled}
      />
    </>
  );

  const description = 'So sánh lượt Thử đồ AI, AI Stylist và chat AI của từng gói, rồi chọn gói hợp với bạn.';

  if (status === 'authenticated') {
    return (
      <AccountShell title="Gói thành viên" description={description}>
        {content}
      </AccountShell>
    );
  }

  return (
    <div className="landing-paper-texture">
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-6 md:px-8 md:pt-12">
        <header className="mb-8 border-b border-landing-line pb-6">
          <p className={accountLabelClassName}>Gói thành viên</p>
          <h1 className="mt-3 font-display text-landing-h2 text-landing-obsidian">Gói thành viên</h1>
          <p className="mt-3 max-w-xl text-landing-body text-landing-muted">{description}</p>
        </header>
        {content}
      </div>
    </div>
  );
}
