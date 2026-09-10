import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  Truck,
  Scissors,
  XCircle
} from 'lucide-react';

export const STATUS_CONFIG: Record<string, {
  label: string;
  icon: LucideIcon;
  badge: string;
  step: number;
}> = {
  PENDING: { label: 'Chờ thanh toán', icon: Clock, badge: 'bg-amber-50 text-amber-700 border border-amber-200', step: 0 },
  PAID: { label: 'Đã thanh toán', icon: CheckCircle2, badge: 'bg-blue-50 text-blue-700 border border-blue-200', step: 1 },
  CONFIRMED: { label: 'Đã xác nhận', icon: CheckCircle2, badge: 'bg-blue-50 text-blue-700 border border-blue-200', step: 1 },
  MEASUREMENT_REVIEW: { label: 'Kiểm số đo', icon: Scissors, badge: 'bg-purple-50 text-purple-700 border border-purple-200', step: 2 },
  MEASUREMENT_CONFIRMED: { label: 'Chốt số đo', icon: CheckCircle2, badge: 'bg-purple-50 text-purple-700 border border-purple-200', step: 3 },
  TAILORING: { label: 'Đang may', icon: Scissors, badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200', step: 4 },
  QUALITY_CHECK: { label: 'QC', icon: CheckCircle2, badge: 'bg-cyan-50 text-cyan-700 border border-cyan-200', step: 5 },
  READY_TO_SHIP: { label: 'Sẵn sàng giao', icon: Truck, badge: 'bg-sky-50 text-sky-700 border border-sky-200', step: 6 },
  SHIPPING: { label: 'Đang giao', icon: Truck, badge: 'bg-brand-navy/8 text-brand-navy border border-brand-navy/20', step: 7 },
  DELIVERED: { label: 'Đã giao', icon: CheckCircle2, badge: 'bg-green-50 text-green-700 border border-green-200', step: 8 },
  CANCELLED: { label: 'Đã hủy', icon: XCircle, badge: 'bg-red-50 text-red-600 border border-red-200', step: -1 },
  RETURNED: { label: 'Hoàn trả', icon: RotateCcw, badge: 'bg-neutral-100 text-neutral-600 border border-neutral-300', step: -1 },
  EXPIRED: { label: 'Hết hạn', icon: XCircle, badge: 'bg-neutral-100 text-neutral-500 border border-neutral-300', step: -1 },
  FAILED: { label: 'Thất bại', icon: XCircle, badge: 'bg-red-50 text-red-600 border border-red-200', step: -1 },
};

export const FILTER_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ thanh toán' },
  { id: 'tailoring', label: 'Đang may' },
  { id: 'ready_to_ship', label: 'Sẵn sàng giao' },
  { id: 'shipping', label: 'Đang giao' },
  { id: 'delivered', label: 'Đã giao' },
  { id: 'cancelled', label: 'Đã hủy' },
];

export const STEPS = ['Đặt', 'TT', 'Số đo', 'Chốt', 'May', 'QC', 'Giao', 'Ship', 'Nhận'];
