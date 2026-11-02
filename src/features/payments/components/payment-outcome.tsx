'use client';

import { AtelierLoader } from '@/components/ui/AtelierLoader';
import { getPaymentReturnTarget } from '@/features/payments/services/payment-return';
import { accountButtonClassName, accountLabelClassName } from '@/features/profile/components/account-ui';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type React from 'react';
import { Suspense } from 'react';

function PaymentOutcomeContent({
  title,
  description,
  children,
}: {
  title: string;
  description: React.ReactNode;
  children?: (params: URLSearchParams) => React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const target = getPaymentReturnTarget(params);
  const orderCode = params.get('orderCode');

  return (
    <div className="landing-paper-texture px-4 py-16 md:py-24">
      <section className="mx-auto max-w-[520px] rounded-[2px] border border-landing-line bg-landing-ivory px-6 py-8 sm:px-8">
        <p className={accountLabelClassName}>Thanh toán</p>
        <h1 className="mt-2 font-display text-[2rem] leading-tight text-landing-obsidian">{title}</h1>
        {orderCode ? <p className="mt-2 font-mono text-sm text-landing-muted">ORD-{orderCode}</p> : null}
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-landing-muted">{description}</div>
        {children?.(params)}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={target.href} className={cn(accountButtonClassName('primary'), 'w-full sm:flex-1')}>
            {target.retryLabel}
          </Link>
          <Link href="/products" className={cn(accountButtonClassName('outline'), 'w-full sm:flex-1')}>
            Tiếp tục mua sắm
          </Link>
        </div>
      </section>
    </div>
  );
}

/** Trang khách quay về sau khi hủy / lỗi ở cổng thanh toán. Đơn vẫn chờ thanh toán. */
export function PaymentOutcome(props: React.ComponentProps<typeof PaymentOutcomeContent>) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <AtelierLoader size="md" />
        </div>
      }
    >
      <PaymentOutcomeContent {...props} />
    </Suspense>
  );
}
