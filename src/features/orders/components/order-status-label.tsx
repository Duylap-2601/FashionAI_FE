import { ORDER_STATUS_TONE_CLASSES, STATUS_CONFIG } from '@/features/orders/constants/profile-orders-page';
import type { BackendOrderStatus } from '@/features/orders/types/orders';
import { cn } from '@/lib/utils';

/** Chấm màu + nhãn ngắn của trạng thái đơn. Không dùng pill nền màu. */
export function OrderStatusLabel({ status, className }: { status: BackendOrderStatus; className?: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.CREATED;
  const tone = ORDER_STATUS_TONE_CLASSES[config.tone];
  return (
    <span className={cn('inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]', tone.text, className)}>
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 shrink-0 rounded-full', tone.dot)} />
      {config.label}
    </span>
  );
}
