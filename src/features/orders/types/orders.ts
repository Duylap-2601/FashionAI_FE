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
  wardName?: string;
  notes?: string;
  note?: string;
  ghnProvinceId?: number;
  ghnDistrictId?: number;
  ghnWardCode?: string;
}

export interface CreateOrderRequest {
  items: OrderItemInput[];
  shippingInfo?: ShippingInfo;
  shippingAddressId?: string;
  addressVersion?: number;
  shippingNote?: string;
  quoteToken?: string;
  idempotencyKey?: string;
  paymentMethod?: 'BANK_TRANSFER' | 'BANK' | 'SEPAY' | 'MOMO';
  couponCode?: string;
  discountAmount?: number;
  shippingFee?: number;
  totalAmount?: number;
  targetTier?: 'MEMBER' | 'VIP';
  provider?: 'PAYOS' | 'SEPAY' | 'MOMO';
}

export interface OrderQuote {
  itemsTotal: number;
  shippingFee: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  quoteToken?: string;
  expiresAt?: string;
  shippingQuote?: {
    provider: 'GHN';
    totalFee: number;
    serviceFee?: number;
    insuranceFee?: number;
    codFee?: number;
    expectedDeliveryTime?: string;
  };
}

export type BackendOrderStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING'
  | 'PAID'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'MEASUREMENT_REVIEW'
  | 'MEASUREMENT_CONFIRMED'
  | 'TAILORING'
  | 'QUALITY_CHECK'
  | 'READY_TO_SHIP'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURN_APPROVED'
  | 'RETURNING'
  | 'RETURNED'
  | 'EXPIRED'
  | 'FAILED';

export interface ConfirmDeliveryRequest {
  note?: string;
}

export interface ConfirmDeliveryResponse {
  success: boolean;
  message: string;
  data: BackendOrder;
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | null;
export type RefundStatus = 'NONE' | 'REQUIRED' | 'PROCESSING' | 'COMPLETED';
export type ShipmentStatus = 'PENDING' | 'CREATED' | 'PICKING' | 'PICKED' | 'IN_TRANSIT' | 'DELIVERING' | 'DELIVERED' | 'DELIVERY_FAILED' | 'RETURNING' | 'RETURNED' | 'CANCELLED';

export interface MeasurementDisplayItem {
  field: string;
  label: string;
  value: number;
  unit: string;
}

export type OrderRefundStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface OrderRefund {
  id: string;
  paymentId: string;
  provider: string;
  amountVnd: number;
  reason?: string | null;
  status: OrderRefundStatus;
  requestedAt: string;
  processedAt?: string | null;
  failedReason?: string | null;
}

export interface OrderPayment {
  id?: string;
  provider?: string;
  transactionId?: string | null;
  status?: string;
  amountVnd?: number;
  createdAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  color?: string;
  price: number;
  productSkuSnapshot?: string | null;
  productImageSnapshot?: string | null;
  productCategorySnapshot?: string | null;
  brandSnapshot?: string | null;
  unitPriceVnd?: number;
  lineTotalVnd?: number;
  measurementSnapshot?: MeasurementSnapshot;
  measurementDisplay?: MeasurementDisplayItem[];
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
  userId?: string;
  status: BackendOrderStatus;
  paymentStatus?: PaymentStatus;
  refundStatus?: RefundStatus;
  fulfillmentFlowVersion?: number | null;
  currency?: string;
  itemsSubtotalVnd?: number;
  shippingFeeVnd?: number;
  discountVnd?: number;
  taxVnd?: number;
  totalVnd?: number;
  amountPaidVnd?: number;
  amountRefundedVnd?: number;
  shippingAddressSnapshot?: Record<string, unknown> | null;
  shippingQuoteSnapshot?: Record<string, unknown> | null;
  refundEvidence?: string | null;
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
  payments?: OrderPayment[];
  refunds?: OrderRefund[];
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
  productSkuSnapshot?: string | null;
  productImageSnapshot?: string | null;
  productCategorySnapshot?: string | null;
  brandSnapshot?: string | null;
  unitPriceVnd?: number | string | null;
  lineTotalVnd?: number | string | null;
  measurementSnapshot?: MeasurementSnapshot | null;
  measurementDisplay?: MeasurementDisplayItem[] | null;
  measurementReview?: MeasurementReview | null;
  productNameSnapshot?: string | null;
  fabricSnapshot?: string | null;
  product?: {
    name: string;
    images?: { imageUrl: string; isMain: boolean }[];
  };
}

export interface MeasurementSnapshot {
  height?: number | string | null;
  weight?: number | string | null;
  chest?: number | string | null;
  waist?: number | string | null;
  hip?: number | string | null;
  shoulder?: number | string | null;
  neck?: number | string | null;
  sleeveLength?: number | string | null;
  wrist?: number | string | null;
  thigh?: number | string | null;
  knee?: number | string | null;
  calf?: number | string | null;
  inseam?: number | string | null;
  outseam?: number | string | null;
  shirtLength?: number | string | null;
  underbust?: number | string | null;
  [key: string]: unknown;
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
  quotedShippingFee?: number | null;
  actualShippingFee?: number | null;
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
  userId?: string;
  user?: { id?: string; name?: string; email?: string } | null;
  status: BackendOrderStatus;
  paymentStatus?: PaymentStatus;
  refundStatus?: RefundStatus;
  fulfillmentFlowVersion?: number | null;
  currency?: string;
  itemsSubtotalVnd?: number | string | null;
  shippingFeeVnd?: number | string | null;
  discountVnd?: number | string | null;
  taxVnd?: number | string | null;
  totalVnd?: number | string | null;
  amountPaidVnd?: number | string | null;
  amountRefundedVnd?: number | string | null;
  shippingAddressSnapshot?: Record<string, unknown> | null;
  shippingQuoteSnapshot?: Record<string, unknown> | null;
  refundEvidence?: string | null;
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
  payments?: OrderPayment[];
  refunds?: OrderRefund[];
  shipment?: OrderShipment | null;
  history?: OrderHistoryEvent[];
  allowedActions?: { cancel?: boolean; updateMeasurement?: boolean };
}

export interface OrdersListParams {
  page?: number;
  limit?: number;
  status?: BackendOrderStatus;
  paymentStatus?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export interface OrdersListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrdersListResult {
  orders: Order[];
  meta: OrdersListMeta;
}
