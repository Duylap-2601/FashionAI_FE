'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type PaymentProvider = 'PAYOS' | 'MOMO' | 'SEPAY';
export type TargetTier = 'MEMBER' | 'VIP';

export interface CheckoutRequest {
  targetTier: TargetTier;
  provider?: PaymentProvider; // Default: SEPAY per Swagger
}

export interface CheckoutResponse {
  checkoutUrl?: string;
  paymentUrl?: string;
  orderCode?: number;
  qrCode?: string;
  provider?: PaymentProvider;
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

function extractErrorMessage(error: unknown): string {
  if (!error) return 'Không xác định được lỗi.';
  const anyError = error as any;
  if (anyError?.response?.data?.message) {
    const msg = anyError.response.data.message;
    return Array.isArray(msg) ? msg[0] : msg;
  }
  if (anyError?.response?.data?.error) return anyError.response.data.error;
  if (anyError?.message) return anyError.message;
  return 'Đã xảy ra lỗi không xác định.';
}

/**
 * Hook tạo link thanh toán nâng cấp tài khoản (MEMBER / VIP)
 * POST /payments/checkout
 */
export function useCheckout() {
  const mutation = useMutation({
    mutationFn: async (payload: CheckoutRequest): Promise<CheckoutResponse> => {
      const res = await api.post('/payments/checkout', {
        targetTier: payload.targetTier,
        provider: payload.provider ?? 'SEPAY', // Default SEPAY per Swagger
      });
      return res.data as CheckoutResponse;
    },
  });

  return {
    checkout: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    errorMessage: mutation.error ? extractErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  };
}

/**
 * Hook lấy lịch sử thanh toán của user
 * GET /payments/orders
 */
export function usePaymentOrders() {
  const query = useQuery<PaymentOrder[]>({
    queryKey: ['payment-orders'],
    queryFn: async () => {
      const res = await api.get('/payments/orders');
      return (res.data || []) as PaymentOrder[];
    },
  });

  return {
    paymentOrders: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
