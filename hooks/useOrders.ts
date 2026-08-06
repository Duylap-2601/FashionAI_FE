'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface OrderItemInput {
  productId: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
}

export interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

export interface CreateOrderRequest {
  items: OrderItemInput[];
  shippingInfo: ShippingInfo;
  paymentMethod: 'COD' | 'Bank' | 'EWallet';
  couponCode?: string;
  discountAmount?: number;
  shippingFee?: number;
  totalAmount: number;
  targetTier?: 'MEMBER' | 'VIP';
  provider?: 'MOMO' | 'PAYOS';
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  product?: {
    name: string;
    images?: string[] | { url: string; isPrimary: boolean }[];
  };
}

export interface Order {
  id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  shippingInfo: ShippingInfo;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: async (payload: CreateOrderRequest) => {
      const res = await api.post('/payments/checkout', {
        targetTier: payload.targetTier ?? 'MEMBER',
        provider: payload.provider ?? 'MOMO',
      });
      return res.data;
    },
    onSuccess: () => {
      // Invalidate orders queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
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
  const query = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get('/payments/orders');
      return res.data || [];
    },
  });

  return {
    orders: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useOrder(id: string) {
  const query = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await api.get('/payments/orders');
      return (res.data || []).find((order: Order) => order.id === id);
    },
    enabled: !!id,
  });

  return {
    order: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      throw new Error(`Cancel order is not supported by the backend yet: ${id}`);
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
  });

  return {
    cancelOrder: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
  };
}
