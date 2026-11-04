'use client';

import { mutationKeys } from '@/features/orders/services/mutation-keys';
import { queryKeys as ordersQueryKeys } from '@/features/orders/services/query-keys';
import { createOrderIssue } from '@/features/orders/services/mutations';
import { fetchMyReturns, fetchOrderIssue, fetchOrderIssues } from '@/features/orders/services/queries';
import type { CreateOrderIssuePayload, MyReturnOrder, OrderIssue, OrderIssueListMeta, OrderIssueListParams } from '@/features/orders/types/orders';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useOrderIssues(orderId: string, params?: OrderIssueListParams) {
  const status = useAuthStore((state) => state.status);
  const query = useQuery<{ data: OrderIssue[]; meta: OrderIssueListMeta }>({
    queryKey: ordersQueryKeys.orderIssues(orderId, params),
    queryFn: () => fetchOrderIssues(orderId, params),
    enabled: Boolean(orderId) && status === 'authenticated',
  });

  return {
    issues: query.data?.data || [],
    meta: query.data?.meta,
    isLoading: status === 'loading' || query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Các đơn của tôi có yêu cầu đổi trả (trang Đổi trả & hoàn tiền). */
export function useMyReturns(params?: OrderIssueListParams) {
  const status = useAuthStore((state) => state.status);
  const query = useQuery<{ data: MyReturnOrder[]; meta: OrderIssueListMeta }>({
    queryKey: ordersQueryKeys.myReturns(params),
    queryFn: () => fetchMyReturns(params),
    enabled: status === 'authenticated',
  });

  return {
    orders: query.data?.data || [],
    meta: query.data?.meta,
    isLoading: status === 'loading' || query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useOrderIssue(issueId: string) {
  const status = useAuthStore((state) => state.status);
  const query = useQuery<OrderIssue>({
    queryKey: ordersQueryKeys.orderIssue(issueId),
    queryFn: () => fetchOrderIssue(issueId),
    enabled: Boolean(issueId) && status === 'authenticated',
  });

  return {
    issue: query.data,
    isLoading: status === 'loading' || query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateOrderIssue() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: mutationKeys.createOrderIssue(),
    mutationFn: (payload: CreateOrderIssuePayload) => createOrderIssue(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.orderIssues(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.order(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.myReturns() });
    },
  });

  return {
    createOrderIssue: mutation.mutate,
    createOrderIssueAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
