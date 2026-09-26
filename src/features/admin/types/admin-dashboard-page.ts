import type { BackendOrderStatus } from '@/features/orders/types/orders';

export type AdminPage = 'dashboard' | 'products' | 'collections' | 'users' | 'orders' | 'shipments' | 'reviews' | 'quota' | 'shipping-settings' | 'live-try-on-settings' | 'webhook-failures';

export interface GhnPickupSettings {
  provinceId?: number;
  districtId?: number;
  wardCode?: string;
  source: 'database' | 'env' | 'empty';
}

export interface LiveTryOnTierPolicySettings {
  liveEnabled: boolean;
  dailySeconds: number;
  maxSessionSeconds: number;
}

export interface LiveTryOnSettings {
  enabled: boolean;
  version: number;
  globalDailyCredits: number;
  maxConcurrentSessions: number;
  pauseTimeoutSeconds: number;
  allowedCategories: GarmentCategory[];
  betaUserIds: string[];
  betaProductIds: string[];
  tiers: Record<UserTier, LiveTryOnTierPolicySettings>;
  source: 'database' | 'env';
}

export type UpdateLiveTryOnSettingsInput = Omit<LiveTryOnSettings, 'source'> & {
  reason?: string;
};

export type GarmentCategory = 'UPPER' | 'LOWER' | 'FULL_BODY';

export type GarmentType = 'SHIRT' | 'VEST' | 'JACKET' | 'PANTS' | 'SKIRT' | 'DRESS' | 'JUMPSUIT';

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
  garmentType?: GarmentType;
  price: number;
  status: ProductStatus;
  image: string;
  garmentUrl?: string;
  images?: (AdminProductImage | string)[];
  description?: string;
  material?: string;
  color?: string;
  colors?: { name: string; hex: string }[];
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
  paymentStatus?: string;
  refundStatus?: 'NONE' | 'REQUIRED' | 'PROCESSING' | 'COMPLETED';
  date: string;
  payment: string;
  address?: string;
  phone?: string;
  shipment?: AdminOrderShipmentSummary | null;
}

export interface AdminOrderShipmentSummary {
  id: string;
  provider: string;
  providerOrderCode: string | null;
  status: string;
  rawStatus?: string | null;
  shippingFeeVnd?: number | null;
  expectedDeliveryTime?: string | null;
  lastSyncedAt?: string | null;
}

export interface AdminShipment {
  id: string;
  provider: string;
  providerOrderCode: string | null;
  status: string;
  rawStatus: string | null;
  shippingFeeVnd: number | null;
  shippingFee?: number | null;
  actualShippingFee: number | null;
  quotedShippingFee: number | null;
  expectedDeliveryTime: string | null;
  providerEventAt: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    orderCode: number;
    status: string;
    paymentStatus: string | null;
    totalVnd: number | null;
    amount: number;
  };
  customer: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
  receiver: {
    name: string | null;
    phone: string | null;
    address: string | null;
    provinceName?: string | null;
    districtName?: string | null;
    wardName?: string | null;
  };
  canCancel?: boolean;
  issue?: boolean;
  stale?: boolean;
}

export interface AdminShipmentEvent {
  id: string;
  type: string;
  source: string;
  fromShipmentStatus: string | null;
  toShipmentStatus: string | null;
  publicMessage: string | null;
  internalNote: string | null;
  occurredAt: string;
}

export interface AdminShipmentDetail extends AdminShipment {
  trackingUrl: string | null;
  trackingData: unknown;
  items: Array<{ id: string; productId: string; name: string | null; sku: string | null; quantity: number; price: number }>;
  events: AdminShipmentEvent[];
  webhooks: Array<{ id: string; eventKey: string; eventType: string | null; status: string; receivedAt: string; processedAt: string | null; payload: unknown }>;
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

export interface AdminWebhookFailure {
  id: string;
  provider: string;
  reason: string;
  message: string;
  rawPayload: unknown;
  orderCode: number | null;
  resolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
}

export interface ProductImageItem {
  id: string;
  imageId?: string;
  url: string;
  isMain?: boolean;
  file?: File;
  isExisting?: boolean;
}
