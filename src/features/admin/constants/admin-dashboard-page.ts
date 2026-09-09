import type { GarmentCategory, ProductStatus } from '@/features/admin/types/admin-dashboard-page';
import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle2,
  Clock,
  RotateCcw,
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
  SHIPPING: { label: 'Đang giao', cls: 'bg-brand-navy/8 text-brand-navy border border-brand-navy/20', icon: Truck },
  DELIVERED: { label: 'Đã giao', cls: 'bg-green-50 text-green-700 border border-green-200', icon: CheckCircle2 },
  CANCELLED: { label: 'Đã hủy', cls: 'bg-red-50 text-red-600 border border-red-200', icon: XCircle },
  RETURNED: { label: 'Hoàn trả', cls: 'bg-neutral-100 text-neutral-600 border border-neutral-300', icon: RotateCcw },
  EXPIRED: { label: 'Hết hạn', cls: 'bg-neutral-100 text-neutral-500 border border-neutral-300', icon: XCircle },
  FAILED: { label: 'Thất bại', cls: 'bg-red-50 text-red-600 border border-red-200', icon: XCircle },
};
