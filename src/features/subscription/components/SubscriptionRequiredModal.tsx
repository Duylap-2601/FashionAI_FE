'use client';

import { usePlans } from '@/features/subscription/hooks/useSubscription';
import type { SubscriptionRequiredModalProps } from '@/features/subscription/types/subscription-required-modal';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';
const PAID_TIERS = ['MEMBER', 'VIP'];

function formatVnd(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

export function SubscriptionRequiredModal({
  isOpen,
  onClose,
  reason = 'free_not_allowed',
  actionName = 'Thử đồ AI',
}: SubscriptionRequiredModalProps) {
  const router = useRouter();
  // Giá và lượt lấy từ GET /payments/plans để không lệch với trang gói.
  const { plans, isLoading } = usePlans();
  const paidPlans = plans.filter((plan) => PAID_TIERS.includes(plan.tier));
  const isExpired = reason === 'subscription_expired';

  const handleGoToSubscription = () => {
    onClose();
    router.push('/subscription');
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[110] bg-landing-obsidian/45 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-[111] max-h-[90svh] overflow-y-auto border-t border-landing-line bg-landing-paper px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 text-landing-obsidian data-[state=open]:animate-in data-[state=open]:fade-in-0 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[calc(100%-2rem)] sm:max-w-[460px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:border sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-landing-brass-ink">Gói thành viên</p>
              <Dialog.Title className="mt-1.5 font-display text-2xl leading-tight">
                {isExpired ? 'Gói thành viên đã hết hạn' : `Nâng cấp để dùng ${actionName}`}
              </Dialog.Title>
            </div>
            <Dialog.Close aria-label="Đóng" className={`-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center text-landing-muted transition-colors hover:text-landing-oxblood ${focusRing}`}>
              <X className="h-5 w-5" strokeWidth={1.75} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-2 text-sm leading-relaxed text-landing-muted">
            {isExpired
              ? `Gia hạn gói để tiếp tục dùng ${actionName}.`
              : `${actionName} cần gói Member hoặc VIP. Mỗi gói có lượt mới mỗi ngày.`}
          </Dialog.Description>

          {isLoading ? (
            <div className="mt-5 space-y-2" aria-hidden="true">
              <div className="h-14 animate-pulse bg-landing-taupe/30" />
              <div className="h-14 animate-pulse bg-landing-taupe/30" />
            </div>
          ) : paidPlans.length > 0 ? (
            <ul className="mt-5 divide-y divide-landing-line/70 border-y border-landing-line/70">
              {paidPlans.map((plan) => {
                const tryOn = plan.quotas.find((quota) => quota.action === 'TRY_ON');
                return (
                  <li key={plan.tier} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="font-display text-lg leading-tight">{plan.label}</p>
                      <p className="mt-0.5 text-xs text-landing-muted">
                        {tryOn ? (tryOn.unlimited ? 'Thử đồ không giới hạn' : `${tryOn.limit} lượt thử đồ mỗi ngày`) : null}
                        {plan.durationDays ? ` · ${plan.durationDays} ngày` : null}
                      </p>
                    </div>
                    <span className="font-mono text-sm text-landing-oxblood">{formatVnd(plan.price)}</span>
                  </li>
                );
              })}
            </ul>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className={`inline-flex h-11 items-center justify-center rounded-[2px] border border-landing-line px-5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors hover:border-landing-oxblood hover:text-landing-oxblood ${focusRing}`}>
              Để sau
            </button>
            <button type="button" onClick={handleGoToSubscription} className={`inline-flex h-11 items-center justify-center rounded-[2px] bg-landing-oxblood px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-paper transition-colors hover:bg-landing-obsidian ${focusRing}`}>
              {isExpired ? 'Gia hạn gói' : 'Xem các gói'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
