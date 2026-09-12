import type { GarmentCategory, ProductStatus } from '@/features/admin/types/admin-dashboard-page';
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

export const PRODUCT_STATUS_CFG: Record<ProductStatus, { label: string; cls: string }> = {
  ACTIVE: { label: 'Đang bán', cls: 'bg-green-50 text-green-700 border border-green-200' },
  DRAFT: { label: 'Bản nháp', cls: 'bg-neutral-100 text-neutral-600 border border-neutral-200' },
  ARCHIVED: { label: 'Ngừng bán', cls: 'bg-red-50 text-red-600 border border-red-200' },
};

export const ORDER_STATUS_CFG: Record<string, { label: string; cls: string; icon: LucideIcon }> = {
  PENDING: { label: 'Chờ xác nhận', cls: 'bg-amber-50 text-amber-700 border border-amber-200', icon: Clock },
  PAID: { label: 'Đã thanh toán', cls: 'bg-blue-50 text-blue-700 border border-blue-200', icon: CheckCircle2 },
  CONFIRMED: { label: 'Đã xác nhận', cls: 'bg-blue-50 text-blue-700 border border-blue-200', icon: CheckCircle2 },
  MEASUREMENT_REVIEW: { label: 'Kiểm tra số đo', cls: 'bg-purple-50 text-purple-700 border border-purple-200', icon: Scissors },
  MEASUREMENT_CONFIRMED: { label: 'Chốt số đo', cls: 'bg-purple-50 text-purple-700 border border-purple-200', icon: CheckCircle2 },
  TAILORING: { label: 'Đang may', cls: 'bg-indigo-50 text-indigo-700 border border-indigo-200', icon: Scissors },
  QUALITY_CHECK: { label: 'QC', cls: 'bg-cyan-50 text-cyan-700 border border-cyan-200', icon: CheckCircle2 },
  READY_TO_SHIP: { label: 'Sẵn sàng giao', cls: 'bg-sky-50 text-sky-700 border border-sky-200', icon: Truck },
  SHIPPING: { label: 'Đang giao', cls: 'bg-brand-navy/8 text-brand-navy border border-brand-navy/20', icon: Truck },
  DELIVERED: { label: 'Đã giao', cls: 'bg-green-50 text-green-700 border border-green-200', icon: CheckCircle2 },
  CANCELLED: { label: 'Đã hủy', cls: 'bg-red-50 text-red-600 border border-red-200', icon: XCircle },
  RETURNED: { label: 'Hoàn trả', cls: 'bg-neutral-100 text-neutral-600 border border-neutral-300', icon: RotateCcw },
  EXPIRED: { label: 'Hết hạn', cls: 'bg-neutral-100 text-neutral-500 border border-neutral-300', icon: XCircle },
  FAILED: { label: 'Thất bại', cls: 'bg-red-50 text-red-600 border border-red-200', icon: XCircle },
};
