import type { GarmentCategory, ProductStatus } from '@/features/admin/types/admin-dashboard-page';
import type { OrderDisplayStatus } from '@/features/orders/types/orders';
import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  Scissors,
  Truck,
  XCircle
} from 'lucide-react';

export const CATEGORY_LABEL: Record<GarmentCategory, string> = {
  UPPER: 'Áo',
  LOWER: 'Quần / Váy',
  FULL_BODY: 'Toàn thân',
};

export const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL', 'Free'];

export const PRODUCT_STATUS_CFG: Record<ProductStatus, { label: string; cls: string; dotCls: string }> = {
  ACTIVE: {
    label: 'Đang bán',
    cls: 'text-neutral-900',
    dotCls: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.45)]',
  },
  DRAFT: {
    label: 'Bản nháp',
    cls: 'text-neutral-500',
    dotCls: 'bg-neutral-300',
  },
  ARCHIVED: {
    label: 'Ngừng bán',
    cls: 'text-neutral-400',
    dotCls: 'bg-stone-400',
  },
};

export const ORDER_STATUS_CFG: Record<string, { label: string; cls: string; icon: LucideIcon }> = {
  CREATED: { label: 'Đã tạo', cls: 'bg-slate-500/10 text-slate-800 border border-slate-500/20', icon: Clock },
  PENDING: { label: 'Chờ xác nhận', cls: 'bg-amber-500/10 text-amber-900 border border-amber-500/20', icon: Clock },
  PAID: { label: 'Đã thanh toán', cls: 'bg-emerald-500/10 text-emerald-900 border border-emerald-500/20', icon: CheckCircle2 },
  CONFIRMED: { label: 'Đã xác nhận', cls: 'bg-emerald-500/10 text-emerald-900 border border-emerald-500/20', icon: CheckCircle2 },
  MEASUREMENT_REVIEW: { label: 'Kiểm tra số đo', cls: 'bg-brand-navy/8 text-brand-navy border border-brand-navy/15', icon: Scissors },
  MEASUREMENT_CONFIRMED: { label: 'Chốt số đo', cls: 'bg-brand-navy/10 text-brand-navy border border-brand-navy/20', icon: CheckCircle2 },
  TAILORING: { label: 'Đang may', cls: 'bg-[#5D1C34]/10 text-[#5D1C34] border border-[#5D1C34]/20', icon: Scissors },
  QUALITY_CHECK: { label: 'Kiểm tra chất lượng', cls: 'bg-brand-gold/15 text-brand-navy border border-brand-gold/30', icon: CheckCircle2 },
  READY_TO_SHIP: { label: 'Sẵn sàng giao', cls: 'bg-sky-500/10 text-sky-900 border border-sky-500/20', icon: Truck },
  SHIPPING: { label: 'Đang giao', cls: 'bg-brand-navy/10 text-brand-navy border border-brand-navy/20', icon: Truck },
  DELIVERED: { label: 'Đã giao hàng', cls: 'bg-emerald-500/10 text-emerald-900 border border-emerald-500/20', icon: CheckCircle2 },
  COMPLETED: { label: 'Hoàn thành', cls: 'bg-emerald-500/12 text-emerald-950 border border-emerald-600/25', icon: CheckCircle2 },
  CANCELLED: { label: 'Đã hủy', cls: 'bg-rose-500/10 text-rose-900 border border-rose-500/20', icon: XCircle },
  RETURNED: { label: 'Hoàn trả', cls: 'bg-neutral-100 text-neutral-700 border border-neutral-200', icon: RotateCcw },
  EXPIRED: { label: 'Hết hạn', cls: 'bg-neutral-100 text-neutral-500 border border-neutral-200', icon: XCircle },
  FAILED: { label: 'Thất bại', cls: 'bg-rose-500/10 text-rose-900 border border-rose-500/20', icon: XCircle },
};

export function resolveOrderStatusCfg(
  status: string,
  displayStatus?: OrderDisplayStatus | null
): { label: string; cls: string; icon: LucideIcon } {
  const base = ORDER_STATUS_CFG[status] || ORDER_STATUS_CFG.PENDING;
  if (!displayStatus || displayStatus.source === 'ORDER') return base;

  const code = (displayStatus.code || '').toLowerCase();
  let visual = ORDER_STATUS_CFG.SHIPPING;
  if (code === 'delivered') visual = ORDER_STATUS_CFG.DELIVERED;
  else if (code === 'cancel') visual = ORDER_STATUS_CFG.CANCELLED;
  else if (displayStatus.issue) visual = ORDER_STATUS_CFG.FAILED;
  else if (code.startsWith('return')) visual = ORDER_STATUS_CFG.RETURNED;

  return { ...visual, label: displayStatus.label };
}
