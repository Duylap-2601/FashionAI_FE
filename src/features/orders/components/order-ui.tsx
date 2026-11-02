'use client';

import { ORDER_IMAGE_FALLBACK, ORDER_STEPS } from '@/features/orders/constants/profile-orders-page';
import { getOrderItemImage, getOrderItemName } from '@/features/orders/services/order-display';
import type { OrderItem } from '@/features/orders/types/orders';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type React from 'react';
import { useState } from 'react';

// Mảnh giao diện dùng chung cho danh sách đơn (/profile/orders) và chi tiết đơn (/orders/[id]).

export function OrderThumb({ item, className }: { item: OrderItem; className?: string }) {
  const [src, setSrc] = useState(() => getOrderItemImage(item));
  return (
    <span className={cn('relative block shrink-0 overflow-hidden rounded-[2px] bg-landing-paper', className)}>
      <Image src={src} alt={getOrderItemName(item)} fill sizes="64px" className="object-cover" onError={() => setSrc(ORDER_IMAGE_FALLBACK)} />
    </span>
  );
}

export function OrderProgress({ step }: { step: number }) {
  return (
    <ol className="grid grid-cols-5 gap-1.5" aria-label="Tiến độ đơn hàng">
      {ORDER_STEPS.map((label, index) => {
        const done = index <= step;
        const current = index === step;
        return (
          <li key={label} aria-current={current ? 'step' : undefined}>
            <span aria-hidden="true" className={cn('block h-0.5', done ? 'bg-landing-oxblood' : 'bg-landing-taupe/60')} />
            <span
              className={cn(
                'mt-2 block text-[11px] leading-snug',
                current ? 'font-medium text-landing-oxblood' : done ? 'text-landing-obsidian/80' : 'text-landing-muted',
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function SummaryRow({ label, children, strong = false }: { label: string; children: React.ReactNode; strong?: boolean }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-4 py-1.5', strong && 'mt-1 border-t border-landing-line/70 pt-3')}>
      <dt className={cn('text-sm', strong ? 'font-medium text-landing-obsidian' : 'text-landing-muted')}>{label}</dt>
      <dd className={cn('text-right text-sm', strong ? 'font-mono text-base text-landing-oxblood' : 'text-landing-obsidian')}>{children}</dd>
    </div>
  );
}
