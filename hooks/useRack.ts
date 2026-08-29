'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

export interface BackendRackProduct {
  id: string;
  name: string;
  brand?: string | null;
  category: string;
  price: string | number;
  originalPrice?: string | number | null;
  images?: ({ imageUrl?: string; url?: string; isMain?: boolean } | string)[] | null;
  garmentUrl?: string | null;
  description?: string | null;
}

export interface RackItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: BackendRackProduct;
}

export function useRackItems() {
  const { status } = useSession();
  const query = useQuery<RackItem[]>({
    queryKey: ['rack'],
    queryFn: async () => {
      const res = await api.get('/rack');
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.items)) return data.items;
      return [];
    },
    enabled: status === 'authenticated',
  });

  const items = query.data || [];

  const isPinned = (productId: string) => {
    return items.some((item) => item.productId === productId || item.product?.id === productId);
  };

  const getItemByProductId = (productId: string) => {
    return items.find((item) => item.productId === productId || item.product?.id === productId);
  };

  return {
    items,
    isPinned,
    getItemByProductId,
    isLoading: status === 'loading' || query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function usePinToRack() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await api.post('/rack', { productId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rack'] });
    },
  });

  return {
    pinProduct: mutation.mutate,
    pinProductAsync: mutation.mutateAsync,
    isPinning: mutation.isPending,
  };
}

export function useUnpinFromRack() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/rack/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rack'] });
    },
  });

  return {
    unpinProduct: mutation.mutate,
    unpinProductAsync: mutation.mutateAsync,
    isUnpinning: mutation.isPending,
  };
}

export function useClearRack() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete('/rack/all');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rack'] });
    },
  });

  return {
    clearRack: mutation.mutate,
    clearRackAsync: mutation.mutateAsync,
    isClearing: mutation.isPending,
  };
}
