import type { BackendOrderStatus } from '@/features/orders/types/orders';

export type AdminPage = 'dashboard' | 'products' | 'collections' | 'users' | 'orders' | 'reviews' | 'quota';

export type GarmentCategory = 'UPPER' | 'LOWER' | 'FULL_BODY';

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export type UserTier = 'FREE' | 'MEMBER' | 'VIP';

export type UserRole = 'USER' | 'ADMIN';

export interface AdminProductImage {
  id: string;
  imageUrl: string;
  isMain?: boolean;
}

export interface AdminProduct {
  id: string;
  name: string;
  category: GarmentCategory;
  price: number;
  status: ProductStatus;
  image: string;
  garmentUrl?: string;
  images?: (AdminProductImage | string)[];
  description?: string;
  material?: string;
  color?: string;
  colors?: { name: string; hex: string }[];
  stock?: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  tier: UserTier;
  role: UserRole;
  isVerified: boolean;
  joinDate: string;
  tryOns: number;
  orders: number;
  spent: number;
}

export interface AdminOrder {
  id: string;
  code: string;
  orderCode: number;
  customer: string;
  email: string;
  items: number;
  total: number;
  status: BackendOrderStatus;
  date: string;
  payment: string;
  address?: string;
  phone?: string;
}

export interface AdminStats {
  userCount: number;
  productCount: number;
  orderCount: number;
  tryOnCount: number;
  tryOnToday: number;
  stylistCount: number;
  totalRevenue: number;
}

export interface ProductImageItem {
  id: string;
  imageId?: string;
  url: string;
  isMain?: boolean;
  file?: File;
  isExisting?: boolean;
}
