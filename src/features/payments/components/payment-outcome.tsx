'use client';

import { AtelierLoader } from '@/components/ui/AtelierLoader';
import { ToneLabel } from '@/features/orders/components/order-status-label';
import type { OrderStatusTone } from '@/features/orders/constants/profile-orders-page';
import { getPaymentReturnTarget } from '@/features/payments/services/payment-return';
import { accountButtonClassName, accountLabelClassName } from '@/features/profile/components/account-ui';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type React from 'react';
import { Suspense } from 'react';

/**
 * Khung kết quả thanh toán (Atelier Paper): ivory panel trên nền giấy, nhãn brass, tiêu đề
 * Playfair, trạng thái là chấm màu + nhãn viết hoa, mã đơn mono. Dùng chung cho thành công,
 * đang xác nhận, thất bại và hủy.
 */
export function PaymentStatusCard({
  title,
  description,
  orderCode,
  status,
  primary,
  children,
}: {
  title: string;
  description: React.ReactNode;
  orderCode?: number | string | null;
  status?: { tone: OrderStatusTone; label: string };
  primary: { href: string; label: string };
  children?: React.ReactNode;
}) {
  return (
    <div className="landing-paper-texture px-4 py-16 md:py-24">
      <section className="mx-auto max-w-[520px] rounded-[2px] border border-landing-line bg-landing-ivory px-6 py-8 sm:px-8">
        <p className={accountLabelClassName}>Thanh toán</p>
        <h1 className="mt-2 font-display text-[2rem] leading-tight text-landing-obsidian">{title}</h1>
        {status || orderCode ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            {status ? <ToneLabel tone={status.tone} label={status.label} /> : null}
            {orderCode ? <span className="font-mono text-sm text-landing-muted">ORD-{orderCode}</span> : null}
          </div>
        ) : null}
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-landing-muted">{description}</div>
        {children}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={primary.href} className={cn(accountButtonClassName('primary'), 'w-full sm:flex-1')}>
            {primary.label}
          </Link>
          <Link href="/products" className={cn(accountButtonClassName('outline'), 'w-full sm:flex-1')}>
            Tiếp tục mua sắm
          </Link>
        </div>
      </section>
    </div>
  );
}

export function PaymentLoading() {
  return (
    <div className="landing-paper-texture flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <AtelierLoader size="md" />
      <p className="text-sm text-landing-muted">Đang kiểm tra trạng thái thanh toán</p>
    </div>
  );
}

function PaymentOutcomeContent({
  title,
  description,
  status,
  children,
}: {
  title: string;
  description: React.ReactNode;
  status?: { tone: OrderStatusTone; label: string };
  children?: (params: URLSearchParams) => React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const target = getPaymentReturnTarget(params);

  return (
    <PaymentStatusCard
      title={title}
      description={description}
      orderCode={params.get('orderCode')}
      status={status}
      primary={{ href: target.href, label: target.retryLabel }}
    >
      {children?.(params)}
    </PaymentStatusCard>
  );
}

/** Trang khách quay về sau khi hủy / lỗi ở cổng thanh toán. Đơn vẫn chờ thanh toán. */
export function PaymentOutcome(props: React.ComponentProps<typeof PaymentOutcomeContent>) {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentOutcomeContent {...props} />
    </Suspense>
  );
}
