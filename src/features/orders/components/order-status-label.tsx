import { ORDER_STATUS_TONE_CLASSES, STATUS_CONFIG, type OrderStatusTone } from '@/features/orders/constants/profile-orders-page';
import type { BackendOrderStatus } from '@/features/orders/types/orders';
import { cn } from '@/lib/utils';

/** Chấm màu + nhãn viết hoa theo tông trạng thái (đơn, báo lỗi, hoàn tiền). Không dùng pill nền màu. */
export function ToneLabel({ tone, label, className }: { tone: OrderStatusTone; label: string; className?: string }) {
  const classes = ORDER_STATUS_TONE_CLASSES[tone];
  return (
    <span className={cn('inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]', classes.text, className)}>
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 shrink-0 rounded-full', classes.dot)} />
      {label}
    </span>
  );
}

/** Chấm màu + nhãn ngắn của trạng thái đơn. */
export function OrderStatusLabel({ status, className }: { status: BackendOrderStatus; className?: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.CREATED;
  return <ToneLabel tone={config.tone} label={config.label} className={className} />;
}
