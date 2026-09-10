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
  provinceName?: string;
  districtName?: string;
  notes?: string;
  note?: string;
  ghnProvinceId?: number;
  ghnDistrictId?: number;
  ghnWardCode?: string;
}

export interface CreateOrderRequest {
  items: OrderItemInput[];
  shippingInfo: ShippingInfo;
  paymentMethod?: 'BANK_TRANSFER' | 'BANK' | 'SEPAY';
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
  | 'MEASUREMENT_REVIEW'
  | 'MEASUREMENT_CONFIRMED'
  | 'TAILORING'
  | 'QUALITY_CHECK'
  | 'READY_TO_SHIP'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'EXPIRED'
  | 'FAILED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | null;
export type RefundStatus = 'NONE' | 'REQUIRED' | 'PROCESSING' | 'COMPLETED';
export type ShipmentStatus = 'PENDING' | 'CREATED' | 'PICKING' | 'PICKED' | 'IN_TRANSIT' | 'DELIVERING' | 'DELIVERED' | 'DELIVERY_FAILED' | 'RETURNING' | 'RETURNED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  color?: string;
  price: number;
  measurementSnapshot?: MeasurementSnapshot;
  measurementReview?: MeasurementReview;
  productNameSnapshot?: string | null;
  fabricSnapshot?: string | null;
  product?: {
    name: string;
    images?: string[];
  };
}

export interface Order {
  id: string;
  orderCode: number;
  status: BackendOrderStatus;
  paymentStatus?: PaymentStatus;
  refundStatus?: RefundStatus;
  fulfillmentFlowVersion?: number | null;
  totalAmount: number;
  itemsTotal: number;
  shippingFee: number;
  discountAmount: number;
  shippingInfo: ShippingInfo;
  paymentMethod: string;
  paymentProvider?: string | null;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
  shipment?: OrderShipment | null;
  history?: OrderHistoryEvent[];
  allowedActions?: { cancel?: boolean; updateMeasurement?: boolean };
}

export interface BackendOrderItem {
  id: string;
  productId: string;
  quantity: number;
  color?: string | null;
  price: number | string;
  measurementSnapshot?: MeasurementSnapshot | null;
  measurementReview?: MeasurementReview | null;
  productNameSnapshot?: string | null;
  fabricSnapshot?: string | null;
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

export interface MeasurementReview {
  status?: 'OPEN' | 'SUBMITTED' | string;
  message?: string;
  openedAt?: string;
  submittedAt?: string;
}

export interface OrderShipment {
  id: string;
  provider: string;
  providerOrderCode?: string | null;
  status: ShipmentStatus;
  shippingFee?: number | null;
  expectedDeliveryTime?: string | null;
  lastSyncedAt?: string | null;
}

export interface OrderHistoryEvent {
  id: string;
  type: string;
  fromStatus?: BackendOrderStatus | null;
  toStatus?: BackendOrderStatus | null;
  source: string;
  occurredAt: string;
  publicMessage?: string | null;
  shipmentId?: string | null;
}

export interface BackendOrder {
  id: string;
  orderCode: number;
  status: BackendOrderStatus;
  paymentStatus?: PaymentStatus;
  refundStatus?: RefundStatus;
  fulfillmentFlowVersion?: number | null;
  amount: number | string;
  itemsTotal?: number | string;
  shippingFee?: number | string | null;
  discountAmount?: number | string | null;
  shippingInfo?: ShippingInfo | null;
  paymentMethod?: string | null;
  paymentProvider?: string | null;
  createdAt: string;
  updatedAt?: string;
  items?: BackendOrderItem[];
  payments?: { provider?: string }[];
  shipment?: OrderShipment | null;
  history?: OrderHistoryEvent[];
  allowedActions?: { cancel?: boolean; updateMeasurement?: boolean };
}
