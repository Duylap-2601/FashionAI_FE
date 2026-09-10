'use client';

import { mutationKeys } from '@/features/orders/services/mutation-keys';
import { queryKeys as ordersQueryKeys } from '@/features/orders/services/query-keys';
import { cancelOrder, createOrder } from '@/features/orders/services/mutations';
import { fetchOrder, fetchOrders } from '@/features/orders/services/queries';
import { isTerminalOrderStatus } from '@/features/orders/services/orders-utils';
import type { Order } from '@/features/orders/types/orders';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useCreateOrder() {
  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationKey: mutationKeys.createOrder(),
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.orders() });
    },
  });

  return {
    createOrder: createOrderMutation.mutate,
    createOrderAsync: createOrderMutation.mutateAsync,
    isSubmitting: createOrderMutation.isPending,
    error: createOrderMutation.error,
  };
}

export function useOrders() {
  const status = useAuthStore((state) => state.status);
  const query = useQuery<Order[]>({
    queryKey: ordersQueryKeys.orders(),
    queryFn: fetchOrders,
    enabled: status === 'authenticated',
  });

  return {
    orders: query.data || [],
    isLoading: status === 'loading' || query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useOrder(id: string) {
  const status = useAuthStore((state) => state.status);
  const query = useQuery<Order>({
    queryKey: ordersQueryKeys.order(id),
    queryFn: () => fetchOrder(id),
    enabled: status === 'authenticated' && !!id,
    refetchInterval: (query) => {
      const order = query.state.data;
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return false;
      if (!order || isTerminalOrderStatus(order.status)) return false;
      return 30_000;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return {
    order: query.data,
    isLoading: status === 'loading' || query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationKey: mutationKeys.cancelOrder(),
    mutationFn: cancelOrder,
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.orders() });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.order(id) });
    },
  });

  return {
    cancelOrder: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
  };
}
