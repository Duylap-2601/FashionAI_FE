'use client';

import { mutationKeys } from '@/features/payments/services/mutation-keys';
import { queryKeys as paymentsQueryKeys } from '@/features/payments/services/query-keys';
import { checkout } from '@/features/payments/services/mutations';
import { fetchPaymentOrders } from '@/features/payments/services/queries';
import { extractErrorMessage } from '@/features/payments/services/payments-utils';
import type { PaymentOrder } from '@/features/payments/types/payments';
import { useMutation, useQuery } from '@tanstack/react-query';

/**
 * Hook tạo link thanh toán nâng cấp tài khoản (MEMBER / VIP)
 * POST /payments/checkout
 */
export function useCheckout() {
  const mutation = useMutation({
    mutationKey: mutationKeys.checkout(),
    mutationFn: checkout,
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
    queryKey: paymentsQueryKeys.paymentOrders(),
    queryFn: fetchPaymentOrders,
  });

  return {
    paymentOrders: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
