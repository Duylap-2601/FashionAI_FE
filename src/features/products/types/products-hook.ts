import type { GarmentType } from '@/features/products/types/products';

export interface BackendProduct {
  id: string;
  name: string;
  description?: string | null;
  material?: string | null;
  category: string;
  garmentType?: GarmentType | string | null;
  brand?: string | null;
  color?: string | null;
  colors?: ({ name: string; hex?: string } | string)[] | null;
  price: string | number;
  originalPrice?: string | number | null;
  stock?: number | null;
  soldCount?: number | null;
  garmentUrl?: string | null;
  images?: ({ imageUrl?: string; url?: string; isMain?: boolean } | string)[] | null;
  avgRating?: number | string | null;
  reviewCount?: number | null;
}

export interface ProductListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ProductSort = 'latest' | 'price_asc' | 'price_desc';

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: 'UPPER' | 'LOWER' | 'FULL_BODY';
  garmentType?: GarmentType;
  color?: string;
  subCategory?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  enabled?: boolean;
}

export interface ProductListResult {
  products: import('@/features/products/types/products').Product[];
  meta: ProductListMeta;
}

export const DEFAULT_PRODUCT_LIST_META: ProductListMeta = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
};
