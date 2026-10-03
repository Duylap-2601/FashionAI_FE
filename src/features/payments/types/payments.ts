export type PaymentProvider = 'PAYOS' | 'SEPAY' | 'MOMO' | 'ZALOPAY';

export type TargetTier = 'MEMBER' | 'VIP';

export interface CheckoutRequest {
  orderId?: string;
  targetTier?: TargetTier;
  provider?: PaymentProvider;
}

export interface ProrationBreakdown {
  oldTier: string;
  newTier: string;
  remainingDays: number;
  credit: number;
  debit: number;
  net: number;
}

export interface CheckoutResponse {
  orderId?: string;
  paymentId?: string;
  checkoutUrl?: string;
  paymentUrl?: string;
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
  orderCode?: number;
  qrCode?: string;
  provider?: PaymentProvider;
  proration?: ProrationBreakdown | null;
  extra?: {
    formAction?: string;
    formMethod?: string;
    formFields?: Record<string, string>;
    invoiceNumber?: string;
    [key: string]: unknown;
  };
}

export interface PaymentOrder {
  id: string;
  orderCode: number;
  status: string;
  amount: number;
  provider?: string;
  targetTier?: TargetTier;
  createdAt: string;
}

export interface PaymentStatusResponse {
  id: string;
  orderId: string;
  orderCode: number;
  provider: PaymentProvider | string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUND_REQUIRED' | 'REFUND_PENDING' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | string;
  orderStatus: string;
  paymentStatus?: string | null;
  amountVnd?: number | null;
  currency: string;
  paidAt?: string | null;
  failedAt?: string | null;
  failureReason?: string | null;
  expiresAt?: string | null;
  targetTier?: TargetTier | null;
}
