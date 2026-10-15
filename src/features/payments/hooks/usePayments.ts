'use client';

import { mutationKeys } from '@/features/payments/services/mutation-keys';
import { useAuthStore } from '@/features/auth/store/authStore';
import { queryKeys as paymentsQueryKeys } from '@/features/payments/services/query-keys';
import { checkout } from '@/features/payments/services/mutations';
import { fetchPaymentOrders, fetchPaymentStatus } from '@/features/payments/services/queries';
import { extractErrorMessage } from '@/features/payments/services/payments-utils';
import { getAnalyticsIds } from '@/lib/analytics';
import type { CheckoutRequest, PaymentOrder, PaymentStatusResponse } from '@/features/payments/types/payments';
import { useMutation, useQuery } from '@tanstack/react-query';

/**
 * Hook tạo link thanh toán nâng cấp tài khoản (MEMBER / VIP)
 * POST /payments/checkout
 */
export function useCheckout() {
  const mutation = useMutation({
    mutationKey: mutationKeys.checkout(),
    // Gửi kèm định danh GA4 để BE gửi purchase vào đúng phiên (rỗng nếu chưa đồng ý cookie).
    mutationFn: async (payload: CheckoutRequest) => checkout({ ...payload, ...(await getAnalyticsIds()) }),
  });

  return {
    checkout: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    errorMessage: mutation.error ? extractErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  };
}

export function usePaymentStatus(paymentId: string | null) {
  const authStatus = useAuthStore((state) => state.status);

  return useQuery<PaymentStatusResponse>({
    queryKey: paymentsQueryKeys.paymentStatus(paymentId ?? ''),
    queryFn: () => fetchPaymentStatus(paymentId ?? ''),
    enabled: Boolean(paymentId) && authStatus === 'authenticated',
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'PENDING' ? 2_000 : false;
    },
  });
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
