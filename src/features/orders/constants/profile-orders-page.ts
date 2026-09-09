import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  Truck,
  XCircle
} from 'lucide-react';

export const STATUS_CONFIG: Record<string, {
  label: string;
  icon: LucideIcon;
  badge: string;
  step: number;
}> = {
  PENDING: { label: 'Chờ xác nhận', icon: Clock, badge: 'bg-amber-50 text-amber-700 border border-amber-200', step: 0 },
  PAID: { label: 'Đã thanh toán', icon: CheckCircle2, badge: 'bg-blue-50 text-blue-700 border border-blue-200', step: 1 },
  CONFIRMED: { label: 'Đã xác nhận', icon: CheckCircle2, badge: 'bg-blue-50 text-blue-700 border border-blue-200', step: 1 },
  SHIPPING: { label: 'Đang giao', icon: Truck, badge: 'bg-brand-navy/8 text-brand-navy border border-brand-navy/20', step: 2 },
  DELIVERED: { label: 'Đã giao', icon: CheckCircle2, badge: 'bg-green-50 text-green-700 border border-green-200', step: 3 },
  CANCELLED: { label: 'Đã hủy', icon: XCircle, badge: 'bg-red-50 text-red-600 border border-red-200', step: -1 },
  RETURNED: { label: 'Hoàn trả', icon: RotateCcw, badge: 'bg-neutral-100 text-neutral-600 border border-neutral-300', step: -1 },
  EXPIRED: { label: 'Hết hạn', icon: XCircle, badge: 'bg-neutral-100 text-neutral-500 border border-neutral-300', step: -1 },
  FAILED: { label: 'Thất bại', icon: XCircle, badge: 'bg-red-50 text-red-600 border border-red-200', step: -1 },
};

export const FILTER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ xác nhận' },
  { id: 'shipping', label: 'Đang giao' },
  { id: 'delivered', label: 'Đã giao' },
  { id: 'cancelled', label: 'Đã hủy' },
];

export const STEPS = ['Đặt hàng', 'Xác nhận', 'Đang giao', 'Đã nhận'];
