import { ADMIN_PRODUCT_FALLBACK_IMAGE } from '@/features/admin/constants/admin-dashboard-page';
import type {
  AdminOrder,
  AdminProduct,
  AdminProductImage,
  AdminUser,
  GarmentCategory,
  ProductImageItem,
  ProductStatus,
  UserRole,
  UserTier,
} from '@/features/admin/types/admin-dashboard-page';
import type { AdminImageDto, AdminOrderDto, AdminPaginatedResponse, AdminProductDto, AdminUserDto } from '@/features/admin/types/api';
import type { BackendOrderStatus } from '@/features/orders/types/orders';

export interface AdminListPayload<T> {
  items: T[];
  serverTotal?: number;
  serverTotalPages?: number;
}

/** Đọc list admin: backend có thể trả mảng, `{ items }`, và tổng nằm ở `__meta`/`meta`/`pagination`/`total`. */
export function readAdminList<T>(res: unknown): AdminListPayload<T> {
  const resObj = res as AdminPaginatedResponse<T> | undefined;
  const items = (Array.isArray(res) ? res : resObj?.items || []) as T[];
  const meta = resObj?.__meta || resObj?.meta || resObj?.pagination;
  const serverTotal = typeof meta?.total === 'number'
    ? meta.total
    : typeof resObj?.total === 'number' ? resObj.total : undefined;
  const serverTotalPages = typeof meta?.totalPages === 'number' ? meta.totalPages : undefined;
  return { items, serverTotal, serverTotalPages };
}

/** Bóc `{ data }` nếu response còn bọc envelope. */
export function unwrapData<T>(res: unknown): T {
  return (res && typeof res === 'object' && 'data' in res ? (res as { data: unknown }).data : res) as T;
}

/** Order trả về sau một mutation: có thể nằm ở `order`, `data` hoặc chính response. */
export function readUpdatedOrder(res: unknown): AdminOrderDto | undefined {
  const raw = res as ({ order?: AdminOrderDto; data?: AdminOrderDto } & AdminOrderDto) | undefined;
  return raw?.order || raw?.data || raw;
}

function toOptionalNumber(value: number | string | null | undefined): number | undefined {
  return value !== undefined && value !== null ? Number(value) : undefined;
}

export function toAdminProductImages(images: AdminImageDto[]): AdminProductImage[] {
  return images.map((img, idx) => {
    if (typeof img === 'string') {
      return { id: '', imageUrl: img, isMain: idx === 0, colorName: null };
    }
    return {
      id: img.id || '',
      imageUrl: img.imageUrl || img.url || '',
      isMain: Boolean(img.isMain),
      colorName: img.colorName ?? null,
    };
  }).filter((item) => Boolean(item.imageUrl));
}

export function toAdminProduct(p: AdminProductDto): AdminProduct {
  const images = toAdminProductImages(Array.isArray(p.images) ? p.images : []);
  const mainImage = images.find(img => img.isMain)?.imageUrl || images[0]?.imageUrl;
  return {
    id: p.id,
    name: p.name,
    category: p.category as GarmentCategory,
    garmentType: p.garmentType,
    layerRole: p.layerRole ?? null,
    price: Number(p.price),
    status: p.status as ProductStatus,
    image: p.garmentUrl || mainImage || ADMIN_PRODUCT_FALLBACK_IMAGE,
    images,
    garmentUrl: p.garmentUrl,
    description: p.description,
    color: p.color,
    colors: Array.isArray(p.colors) ? p.colors : undefined,
    reviewCount: typeof p.reviewCount === 'number' ? p.reviewCount : undefined,
    avgRating: p.avgRating !== undefined && p.avgRating !== null ? Number(p.avgRating) : undefined,
  };
}

export function toAdminOrder(o: AdminOrderDto): AdminOrder {
  const ship = o.shippingInfo;
  const totalVnd = toOptionalNumber(o.totalVnd);
  return {
    id: o.id,
    code: `#${o.orderCode}`,
    orderCode: Number(o.orderCode),
    customer: ship?.name || o.user?.name || 'Khách hàng',
    email: o.user?.email || ship?.phone || '',
    items: o.items?.length || 1,
    total: totalVnd !== undefined ? totalVnd : Number(o.amount),
    totalVnd,
    itemsSubtotalVnd: toOptionalNumber(o.itemsSubtotalVnd),
    shippingFeeVnd: toOptionalNumber(o.shippingFeeVnd),
    discountVnd: toOptionalNumber(o.discountVnd),
    amountPaidVnd: toOptionalNumber(o.amountPaidVnd),
    amountRefundedVnd: toOptionalNumber(o.amountRefundedVnd),
    status: o.status as BackendOrderStatus,
    displayStatus: o.displayStatus,
    paymentStatus: o.paymentStatus,
    refundStatus: o.refundStatus,
    date: o.createdAt?.substring(0, 10) || '',
    payment: o.payments?.[0]?.provider || 'COD',
    address: ship?.address,
    phone: ship?.phone,
    payments: o.payments,
    refunds: o.refunds,
    shipment: o.shipment || null,
  };
}

/** Gộp order backend trả về sau mutation vào order đang hiển thị, giữ giá trị cũ cho field còn thiếu. */
export function mergeOrderUpdate(
  order: AdminOrder,
  updated: AdminOrderDto | undefined,
  status: BackendOrderStatus,
  paymentStatusFallback?: string,
): AdminOrder {
  const ship = updated?.shippingInfo;
  return {
    ...order,
    status,
    displayStatus: updated?.displayStatus || order.displayStatus,
    refundStatus: updated?.refundStatus || order.refundStatus,
    paymentStatus: updated?.paymentStatus || order.paymentStatus || paymentStatusFallback,
    customer: ship?.name || updated?.user?.name || order.customer,
    email: updated?.user?.email || ship?.phone || order.email,
    address: ship?.address || order.address,
    phone: ship?.phone || order.phone,
    shipment: updated?.shipment || order.shipment,
  };
}

export function toAdminUser(u: AdminUserDto): AdminUser {
  return {
    id: u.id,
    name: u.name || 'Người dùng',
    email: u.email,
    tier: (u.tier || 'FREE') as UserTier,
    role: (u.role || 'USER') as UserRole,
    isVerified: Boolean(u.isVerified),
    joinDate: u.createdAt?.substring(0, 10) || '',
    tryOns: u.tryOns || 0,
    orders: u.orders || 0,
    spent: Number(u.spent || 0),
  };
}

/** Ảnh đã lưu trên backend -> item cho trình sửa sản phẩm. */
export function toProductImageItems(images: AdminImageDto[]): ProductImageItem[] {
  return images.map((img, i) => {
    if (typeof img === 'string') {
      return { id: `existing-${i}-${img}`, imageId: undefined, url: img, isMain: i === 0, isExisting: true, colorName: null };
    }
    const url = img.imageUrl || img.url || '';
    return {
      id: `existing-${img.id || i}-${url}`,
      imageId: img.id,
      url,
      isMain: Boolean(img.isMain),
      isExisting: true,
      colorName: img.colorName ?? null,
    };
  });
}

/** Ảnh ban đầu của trình sửa: danh sách ảnh, hoặc ảnh đại diện/garment khi sản phẩm chưa có danh sách. */
export function toEditorImages(product: Partial<AdminProduct>): ProductImageItem[] {
  const images: AdminImageDto[] = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.image
      ? [{ id: '', imageUrl: product.image, isMain: true }]
      : product.garmentUrl
        ? [{ id: '', imageUrl: product.garmentUrl, isMain: true }]
        : [];
  return toProductImageItems(images);
}

export function toProductImagesPayload(items: ProductImageItem[]): AdminProductImage[] {
  return items.map(item => ({
    id: item.imageId || '',
    imageUrl: item.url,
    isMain: item.isMain,
    colorName: item.colorName ?? null,
  }));
}
