import type { AdminOrderShipmentSummary, AdminProduct, AdminShipment, AdminShipmentDetail, AdminUser } from './admin-dashboard-page';
import type { BackendOrderStatus, OrderPayment, OrderRefund } from '@/features/orders/types/orders';

export type AdminImageDto = string | {
  id?: string;
  imageUrl?: string;
  url?: string;
  isMain?: boolean;
  colorName?: string | null;
};

export interface AdminProductDto extends Omit<AdminProduct, 'image' | 'images' | 'price'> {
  images?: AdminImageDto[];
  price: string | number;
}

export interface AdminOrderDto {
  id: string;
  orderCode: string | number;
  shippingInfo?: { name?: string; phone?: string; address?: string };
  user?: { name?: string; email?: string };
  items?: unknown[];
  amount: string | number;
  itemsTotal?: string | number;
  currency?: string;
  itemsSubtotalVnd?: number | string | null;
  shippingFeeVnd?: number | string | null;
  discountVnd?: number | string | null;
  taxVnd?: number | string | null;
  totalVnd?: number | string | null;
  amountPaidVnd?: number | string | null;
  amountRefundedVnd?: number | string | null;
  status: BackendOrderStatus;
  paymentStatus?: string;
  refundStatus?: 'NONE' | 'REQUIRED' | 'PROCESSING' | 'COMPLETED';
  createdAt?: string;
  payments?: OrderPayment[];
  refunds?: OrderRefund[];
  shipment?: AdminOrderShipmentSummary | null;
}

export type AdminShipmentDto = AdminShipment;

export type AdminShipmentDetailDto = AdminShipmentDetail;

export interface AdminUserDto extends Omit<AdminUser, 'joinDate' | 'spent'> {
  createdAt?: string;
  spent?: string | number;
}

export interface ProductImagesResponse {
  garmentUrl?: string;
  images: AdminImageDto[];
}
