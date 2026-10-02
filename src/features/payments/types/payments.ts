export type PaymentProvider = 'PAYOS' | 'SEPAY';

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
  checkoutUrl?: string;
  paymentUrl?: string;
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
