import type { GarmentCategory, ProductStatus } from '@/features/admin/types/admin-dashboard-page';
import type { BackendOrderStatus } from '@/features/orders/types/orders';

export type PutProductsInput = { name: string; price: number; category: GarmentCategory; color: string | undefined; colors: { name: string; hex: string; }[]; stock: number; material: string | undefined; description: string | undefined; status: ProductStatus; };

export type PatchOrdersStatusInput = { status: BackendOrderStatus; };

export type PatchUsersInput = Record<string, string>;
