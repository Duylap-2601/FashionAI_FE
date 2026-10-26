'use client';

import type { TargetTier } from '@/features/payments/types/payments';
import { accountButtonClassName, accountLabelClassName } from '@/features/profile/components/account-ui';
import { DEFAULT_PLANS } from '@/features/subscription/constants/subscription-page';
import type { PlanItem, PlanQuota } from '@/features/subscription/types/subscription';
import type { SubscriptionPlansProps } from '@/features/subscription/types/subscription-plans';
import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';
import { useMemo } from 'react';

const QUOTA_ROWS: { action: string; label: string; unit: string }[] = [
  { action: 'TRY_ON', label: 'Thử đồ AI bằng ảnh', unit: 'lượt' },
  { action: 'STYLIST', label: 'AI Stylist', unit: 'lượt' },
  { action: 'CHATBOT', label: 'Chat AI', unit: 'tin nhắn' },
];

// Trả lời theo hành vi backend: trừ lượt theo số món, gia hạn nối tiếp, nhắc trước RENEWAL_REMINDER_DAYS_BEFORE (3) ngày.
const FAQS: { question: string; answer: string }[] = [
  {
    question: 'Lượt thử đồ được tính thế nào?',
    answer: 'Mỗi món trong một lần thử bằng ảnh tính 1 lượt, nên phối 3 món tính 3 lượt. Lượt làm mới mỗi ngày. Thử trực tiếp qua camera tính theo thời gian, không trừ lượt thử bằng ảnh.',
  },
  {
    question: 'Gia hạn khi gói còn hạn thì sao?',
    answer: 'Mua thêm cùng gói khi còn hạn thì 30 ngày mới nối tiếp sau ngày hết hạn hiện tại, không mất ngày nào.',
  },
  {
    question: 'Có tự động trừ tiền không?',
    answer: 'Không. Mỗi lần mua hoặc gia hạn là một lần thanh toán riêng. Nếu bật nhắc gia hạn, bạn nhận email nhắc trước 3 ngày khi gói sắp hết hạn.',
  },
];

function formatQuota(quota: PlanQuota | undefined, unit: string) {
  if (!quota) return 'Không có';
  if (quota.unlimited || quota.limit === null) return 'Không giới hạn';
  if (quota.limit === 0) return 'Không có';
  return `${quota.limit} ${unit} / ngày`;
}

function formatVnd(value: number) {
  return value === 0 ? '0đ' : `${value.toLocaleString('vi-VN')}đ`;
}

export function SubscriptionPlans({ status, tier, expirationInfo, scheduled, handleInitiateUpgrade, isCheckoutLoading, apiPlans }: SubscriptionPlansProps) {
  // Giá, thời hạn và lượt lấy từ GET /payments/plans; DEFAULT_PLANS chỉ dự phòng khi API lỗi.
  const plans = useMemo(() => DEFAULT_PLANS.map((plan) => {
    const apiPlan: PlanItem | undefined = apiPlans?.find((p) => p.tier === plan.id);
    const features = apiPlan
      ? [
        ...QUOTA_ROWS.map((row) => {
          const quota = apiPlan.quotas.find((q) => q.action === row.action);
          const value = formatQuota(quota, row.unit);
          return { text: `${row.label}: ${value.toLowerCase()}`, highlight: plan.id !== 'FREE' && value !== 'Không có' };
        }),
        ...(plan.id === 'FREE' ? [] : [{ text: 'Phối bộ khi thử đồ, mỗi món 1 lượt', highlight: false }]),
        { text: 'Lưu số đo và đặt may theo số đo', highlight: false },
      ]
      : plan.features;
    return {
      ...plan,
      name: apiPlan?.label ?? plan.name,
      price: apiPlan?.price ?? plan.numericPrice,
      periodText: apiPlan ? (apiPlan.durationDays > 0 ? `/ ${apiPlan.durationDays} ngày` : 'không thời hạn') : plan.periodText,
      features,
      apiPlan,
    };
  }), [apiPlans]);

  const hasApiPlans = plans.every((plan) => plan.apiPlan);

  return (
    <div className="flex flex-col gap-14">
      {status === 'authenticated' ? (
        <div className="flex flex-col gap-4 border-l-2 border-landing-brass bg-landing-ivory px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={accountLabelClassName}>Gói của bạn</p>
            <p className="mt-1.5 font-display text-2xl leading-tight text-landing-obsidian">
              {plans.find((plan) => plan.id === tier)?.name ?? tier}
            </p>
            <p className={cn('mt-1 text-sm', expirationInfo?.isExpired ? 'text-destructive' : 'text-landing-muted')}>
              {expirationInfo
                ? expirationInfo.isExpired
                  ? `Đã hết hạn ngày ${expirationInfo.formattedDate}. Gia hạn để dùng lại Thử đồ AI.`
                  : `Hiệu lực đến ${expirationInfo.formattedDate}, còn ${expirationInfo.daysRemaining} ngày.`
                : tier === 'FREE'
                  ? 'Gói miễn phí, chưa có lượt Thử đồ AI bằng ảnh.'
                  : 'Đang hoạt động.'}
            </p>
          </div>
          {tier !== 'FREE' ? (
            <p className="max-w-[320px] text-xs leading-relaxed text-landing-muted">
              Gia hạn cùng gói khi còn hạn: 30 ngày mới nối tiếp sau ngày hết hạn hiện tại.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = status === 'authenticated' && tier === plan.id;
          const isDowngradeDisabled = plan.id === 'MEMBER' && tier === 'VIP' && scheduled !== null;
          return (
            <article
              key={plan.id}
              className={cn('flex flex-col border bg-landing-ivory/50 p-6', isCurrent ? 'border-landing-oxblood' : 'border-landing-line')}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-2xl leading-tight text-landing-obsidian">{plan.name}</h3>
                {isCurrent ? <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-landing-oxblood">Gói của bạn</span> : null}
              </div>
              <p className="mt-2 min-h-[40px] text-sm leading-relaxed text-landing-muted">{plan.description}</p>
              <p className="mt-5 flex items-baseline gap-2 border-b border-landing-line/70 pb-5">
                <span className="font-mono text-3xl text-landing-oxblood">{formatVnd(plan.price)}</span>
                <span className="text-sm text-landing-muted">{plan.periodText}</span>
              </p>
              <ul className="mt-5 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-2.5 text-sm">
                    <Check className={cn('mt-0.5 h-4 w-4 shrink-0', feature.highlight ? 'text-landing-oxblood' : 'text-landing-muted')} strokeWidth={2} aria-hidden="true" />
                    <span className={feature.highlight ? 'text-landing-obsidian' : 'text-landing-muted'}>{feature.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {plan.id === 'FREE' ? (
                  <button type="button" disabled className={cn(accountButtonClassName('outline'), 'w-full')}>
                    {isCurrent ? 'Gói hiện tại' : 'Có sẵn khi đăng ký'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleInitiateUpgrade(plan.id as TargetTier)}
                    disabled={isCheckoutLoading || isDowngradeDisabled}
                    className={cn(accountButtonClassName(isCurrent ? 'outline' : 'primary'), 'w-full')}
                  >
                    {isCheckoutLoading ? 'Đang xử lý' : isDowngradeDisabled ? 'Đã lên lịch chuyển gói' : isCurrent ? 'Gia hạn thêm 30 ngày' : `Chọn ${plan.name}`}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {hasApiPlans ? (
        <section aria-labelledby="plan-compare">
          <h2 id="plan-compare" className="font-display text-[1.375rem] leading-tight text-landing-obsidian">So sánh lượt dùng mỗi ngày</h2>
          <div className="mt-4 overflow-x-auto border border-landing-line">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-landing-line bg-landing-ivory/60 text-left">
                  <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-brass-ink">Tính năng</th>
                  {plans.map((plan) => (
                    <th key={plan.id} scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-brass-ink">{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {QUOTA_ROWS.map((row) => (
                  <tr key={row.action} className="border-b border-landing-line/60 last:border-b-0">
                    <th scope="row" className="px-4 py-3 text-left font-normal text-landing-obsidian">{row.label}</th>
                    {plans.map((plan) => {
                      const value = formatQuota(plan.apiPlan?.quotas.find((q) => q.action === row.action), row.unit);
                      return (
                        <td key={plan.id} className={cn('px-4 py-3', value === 'Không có' ? 'text-landing-muted' : 'font-mono text-xs text-landing-obsidian')}>
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="plan-faq" className="max-w-3xl">
        <h2 id="plan-faq" className="font-display text-[1.375rem] leading-tight text-landing-obsidian">Câu hỏi thường gặp</h2>
        <div className="mt-4 divide-y divide-landing-line/70 border-y border-landing-line/70">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group py-1">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-landing-obsidian focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown className="h-4 w-4 shrink-0 text-landing-muted transition-transform group-open:rotate-180" strokeWidth={1.75} aria-hidden="true" />
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-landing-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
