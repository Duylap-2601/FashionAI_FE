export interface OrderItemInput {
  productId: string;
  quantity: number;
  color?: string;
  price: number;
}

export interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

export interface CreateOrderRequest {
  items: OrderItemInput[];
  shippingInfo: ShippingInfo;
  paymentMethod?: 'COD' | 'Bank' | 'EWallet';
  couponCode?: string;
  discountAmount?: number;
  shippingFee?: number;
  totalAmount?: number;
  targetTier?: 'MEMBER' | 'VIP';
  provider?: 'PAYOS' | 'SEPAY';
}

export type BackendOrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'EXPIRED'
  | 'FAILED';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  color?: string;
  price: number;
  measurementSnapshot?: MeasurementSnapshot;
  product?: {
    name: string;
    images?: string[];
  };
}

export interface Order {
  id: string;
  orderCode: number;
  status: BackendOrderStatus;
  totalAmount: number;
  shippingInfo: ShippingInfo;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
}

export interface BackendOrderItem {
  id: string;
  productId: string;
  quantity: number;
  color?: string | null;
  price: number | string;
  measurementSnapshot?: MeasurementSnapshot | null;
  product?: {
    name: string;
    images?: { imageUrl: string; isMain: boolean }[];
  };
}

export interface MeasurementSnapshot {
  chest?: number | string | null;
  waist?: number | string | null;
  hip?: number | string | null;
  shoulder?: number | string | null;
  height?: number | string | null;
}

export interface BackendOrder {
  id: string;
  orderCode: number;
  status: BackendOrderStatus;
  amount: number | string;
  shippingInfo?: ShippingInfo | null;
  createdAt: string;
  items?: BackendOrderItem[];
  payments?: { provider?: string }[];
}
