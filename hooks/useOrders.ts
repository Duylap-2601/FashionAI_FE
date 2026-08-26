'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

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
  notes?: string;
}

export interface CreateOrderRequest {
  items: OrderItemInput[];
  shippingInfo: ShippingInfo;
  paymentMethod?: 'COD' | 'Bank' | 'EWallet';
  couponCode?: string;
  discountAmount?: number;
  shippingFee?: number;
  totalAmount?: number;
  targetTier?: 'MEMBER' | 'VIP';
  provider?: 'PAYOS' | 'SEPAY';
}

export type BackendOrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'EXPIRED'
  | 'FAILED';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  color?: string;
  price: number;
  measurementSnapshot?: Record<string, any>;
  product?: {
    name: string;
    images?: string[];
  };
}

export interface Order {
  id: string;
  orderCode: number;
  status: BackendOrderStatus;
  totalAmount: number;
  shippingInfo: ShippingInfo;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
}

interface BackendOrderItem {
  id: string;
  productId: string;
  quantity: number;
  color?: string | null;
  price: number | string;
  measurementSnapshot?: Record<string, any> | null;
  product?: {
    name: string;
    images?: { imageUrl: string; isMain: boolean }[];
  };
}

interface BackendOrder {
  id: string;
  orderCode: number;
  status: BackendOrderStatus;
  amount: number | string;
  shippingInfo?: ShippingInfo | null;
  createdAt: string;
  items?: BackendOrderItem[];
  payments?: { provider?: string }[];
}

function mapOrder(order: BackendOrder): Order {
  const shippingInfo = order.shippingInfo ?? ({} as ShippingInfo);
  return {
    id: order.id,
    orderCode: order.orderCode,
    status: order.status,
    totalAmount: Number(order.amount),
    shippingInfo: {
      name: shippingInfo.name || '',
      phone: shippingInfo.phone || '',
      address: shippingInfo.address || '',
      notes: shippingInfo.notes,
    },
    paymentMethod: order.payments?.[0]?.provider || 'COD',
    createdAt: order.createdAt,
    items: (order.items || []).map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      color: item.color || '',
      price: Number(item.price),
      measurementSnapshot: item.measurementSnapshot || undefined,
      product: item.product
        ? {
            name: item.product.name,
            images: item.product.images?.map((img) => img.imageUrl) || [],
          }
        : undefined,
    })),
  };
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: async (payload: CreateOrderRequest) => {
      const res = await api.post('/orders', {
        items: payload.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          color: item.color,
          price: item.price,
        })),
        shippingInfo: {
          name: payload.shippingInfo.name,
          phone: payload.shippingInfo.phone,
          address: payload.shippingInfo.address,
          note: payload.shippingInfo.notes,
        },
        paymentMethod: payload.paymentMethod,
        provider: payload.provider,
        couponCode: payload.couponCode,
        discountAmount: payload.discountAmount,
        shippingFee: payload.shippingFee,
        totalAmount: payload.totalAmount,
      });
      return res.data as BackendOrder;
    },
    onSuccess: () => {
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
  const { status } = useSession();
  const query = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return ((res.data || []) as BackendOrder[]).map(mapOrder);
    },
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
  const query = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        return mapOrder(res.data as BackendOrder);
      } catch {
        const res = await api.get('/orders');
        const order = (res.data || []).find((item: BackendOrder) => item.id === id);
        if (!order) throw new Error('Không tìm thấy đơn hàng');
        return mapOrder(order);
      }
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
      const res = await api.patch(`/orders/${id}/cancel`);
      return res.data;
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
