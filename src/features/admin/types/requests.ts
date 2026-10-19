import type { GarmentCategory, ProductColor, ProductStatus } from '@/features/admin/types/admin-dashboard-page';
import type { BackendOrderStatus } from '@/features/orders/types/orders';

export type PutProductsInput = {
  name: string;
  price: number;
  category: GarmentCategory;
  garmentType?: string | null;
  color: string | undefined;
  colors: ProductColor[];
  material: string | undefined;
  description: string | undefined;
  status: ProductStatus;
  images?: Array<{ id: string; colorName?: string | null }>;
};

export type PatchOrdersStatusInput = { status: BackendOrderStatus; };

export type PatchUsersInput = Record<string, string>;
