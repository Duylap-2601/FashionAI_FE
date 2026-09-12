import type { AdminProduct, AdminUser } from './admin-dashboard-page';
import type { BackendOrderStatus } from '@/features/orders/types/orders';

export type AdminImageDto = string | {
  id?: string;
  imageUrl?: string;
  url?: string;
  isMain?: boolean;
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
  status: BackendOrderStatus;
  paymentStatus?: string;
  refundStatus?: 'NONE' | 'REQUIRED' | 'PROCESSING' | 'COMPLETED';
  createdAt?: string;
  payments?: { provider?: string }[];
}

export interface AdminUserDto extends Omit<AdminUser, 'joinDate' | 'spent'> {
  createdAt?: string;
  spent?: string | number;
}

export interface ProductImagesResponse {
  garmentUrl?: string;
  images: AdminImageDto[];
}
