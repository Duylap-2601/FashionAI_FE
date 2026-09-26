import type { GarmentCategory, ProductStatus } from '@/features/admin/types/admin-dashboard-page';
import type { BackendOrderStatus } from '@/features/orders/types/orders';

export type PutProductsInput = { name: string; price: number; category: GarmentCategory; garmentType?: string | null; color: string | undefined; colors: { name: string; hex: string; }[]; material: string | undefined; description: string | undefined; status: ProductStatus; };

export type PatchOrdersStatusInput = { status: BackendOrderStatus; };

export type PatchUsersInput = Record<string, string>;
