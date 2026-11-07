'use client';

import { mutationKeys } from '@/features/orders/services/mutation-keys';
import { queryKeys as ordersQueryKeys } from '@/features/orders/services/query-keys';
import { cancelOrder, confirmDelivery, confirmRefundReceived, createDeliveryDispute, createOrder, updateOrderItemMeasurement } from '@/features/orders/services/mutations';
import { queryKeys as measurementsQueryKeys } from '@/features/measurements/services/query-keys';
import { fetchOrder, fetchOrders, fetchOrdersPage } from '@/features/orders/services/queries';
import { isTerminalOrderStatus, mapOrder } from '@/features/orders/services/orders-utils';
import type { Order, OrdersListParams, OrdersListResult } from '@/features/orders/types/orders';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

/** Đơn đã tạo nhưng chưa thanh toán, để checkout nhắc khách trả đơn cũ thay vì đặt thêm đơn trùng. */
export function useUnpaidOrders() {
  const status = useAuthStore((state) => state.status);
  const query = useQuery({
    queryKey: ordersQueryKeys.orders('unpaid'),
    queryFn: async () => {
      const { orders } = await fetchOrdersPage({ status: 'CREATED', limit: 5 });
      return orders.filter((order) => order.paymentStatus === 'PENDING');
    },
    enabled: status === 'authenticated',
  });
  return query.data ?? [];
}

export function useInfiniteOrders(params: Omit<OrdersListParams, 'page'> = {}) {
  const status = useAuthStore((state) => state.status);
  const query = useInfiniteQuery<OrdersListResult>({
    queryKey: ordersQueryKeys.orders('infinite', params),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchOrdersPage({ ...params, page: Number(pageParam) }),
    getNextPageParam: (lastPage) => (
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined
    ),
    enabled: status === 'authenticated',
  });

  const pages = query.data?.pages || [];
  const meta = pages[pages.length - 1]?.meta || {
    total: 0,
    page: 1,
    limit: params.limit ?? 20,
    totalPages: 0,
  };

  return {
    orders: pages.flatMap((page) => page.orders),
    meta,
    isLoading: status === 'loading' || query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    isError: query.isError,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
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

export function useUpdateItemMeasurement() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: mutationKeys.updateItemMeasurement(),
    mutationFn: updateOrderItemMeasurement,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.order(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.orders() });
      if (variables.syncToProfile) {
        queryClient.invalidateQueries({ queryKey: measurementsQueryKeys.measurements() });
        queryClient.invalidateQueries({ queryKey: measurementsQueryKeys.measurementsCompleteness() });
      }
    },
  });

  return {
    updateItemMeasurement: mutation.mutate,
    updateItemMeasurementAsync: mutation.mutateAsync,
    isUpdatingMeasurement: mutation.isPending,
    error: mutation.error,
  };
}

export function useCreateDeliveryDispute() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: mutationKeys.createDeliveryDispute(),
    mutationFn: createDeliveryDispute,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.order(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.orders() });
    },
  });

  return {
    createDeliveryDispute: mutation.mutate,
    createDeliveryDisputeAsync: mutation.mutateAsync,
    isCreatingDeliveryDispute: mutation.isPending,
  };
}

export function useConfirmRefundReceived() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: mutationKeys.confirmRefundReceived(),
    mutationFn: confirmRefundReceived,
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.order(orderId) });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.orders() });
    },
  });

  return {
    confirmRefundReceived: mutation.mutate,
    isConfirmingRefund: mutation.isPending,
  };
}

export function useConfirmDelivery() {
  const queryClient = useQueryClient();

  const confirmMutation = useMutation({
    mutationKey: mutationKeys.confirmDelivery(),
    mutationFn: confirmDelivery,
    onSuccess: (data, variables) => {
      // The response is the updated order: show it now instead of waiting ~2s for a refetch.
      queryClient.setQueryData(ordersQueryKeys.order(variables.id), mapOrder(data));
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.orders() });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.order(variables.id) });
    },
  });

  return {
    confirmDelivery: confirmMutation.mutate,
    confirmDeliveryAsync: confirmMutation.mutateAsync,
    isConfirmingDelivery: confirmMutation.isPending,
  };
}
