'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

export interface TryOnGarment {
  category: 'UPPER' | 'LOWER' | 'FULL_BODY' | string;
  productId?: string | null;
  image?: string | null;
}

export interface TryOnResult {
  id: string;
  productId?: string;
  category: string;
  resultUrl: string;
  garments?: TryOnGarment[];
  mode?: string;
  createdAt: string;
  isCached?: boolean;
  isCacheHit?: boolean;
  product?: {
    name: string;
    price: number;
  };
}

export interface GarmentSlotInput {
  garmentCategory: 'UPPER' | 'LOWER' | 'FULL_BODY';
  productId?: string;
  garmentImage?: File;
  imageUrl?: string;
}

export interface TryOnRequest {
  humanImage: File;
  garments?: GarmentSlotInput[];
  // Backward compatibility for single garment
  productId?: string;
  garmentImage?: File;
  garmentCategory?: 'UPPER' | 'LOWER' | 'FULL_BODY';
}

export function useTryOn() {
  const queryClient = useQueryClient();

  const tryOnMutation = useMutation({
    mutationFn: async (payload: TryOnRequest) => {
      const formData = new FormData();
      formData.append('humanImage', payload.humanImage);

      if (payload.garments && payload.garments.length > 0) {
        payload.garments.forEach((g, idx) => {
          formData.append(`garments[${idx}][category]`, g.garmentCategory);
          if (g.productId) {
            formData.append(`garments[${idx}][productId]`, g.productId);
          } else if (g.garmentImage) {
            formData.append(`garments[${idx}][image]`, g.garmentImage);
          }
        });
        // Also provide primary fields for backward compatibility
        if (payload.garments[0]?.productId) formData.append('productId', payload.garments[0].productId);
        if (payload.garments[0]?.garmentCategory) formData.append('garmentCategory', payload.garments[0].garmentCategory);
        if (payload.garments[0]?.garmentImage) formData.append('garmentImage', payload.garments[0].garmentImage);
      } else {
        if (payload.garmentImage) formData.append('garmentImage', payload.garmentImage);
        if (payload.productId) formData.append('productId', payload.productId);
        if (payload.garmentCategory) formData.append('garmentCategory', payload.garmentCategory);
      }

      const res = await api.post('/try-on', formData, {
        timeout: 180000,
      });
      return res.data as TryOnResult;
    },
    onSuccess: () => {
      // Invalidate history and quota
      queryClient.invalidateQueries({ queryKey: ['try-on-history'] });
      queryClient.invalidateQueries({ queryKey: ['quota'] });
    },
  });

  return {
    tryOn: tryOnMutation.mutate,
    tryOnAsync: tryOnMutation.mutateAsync,
    isSubmitting: tryOnMutation.isPending,
    error: tryOnMutation.error,
    reset: tryOnMutation.reset,
  };
}

export function useTryOnHistory(page = 1, limit = 50) {
  const { status } = useSession();
  const query = useQuery<TryOnResult[]>({
    queryKey: ['try-on-history', page, limit],
    queryFn: async () => {
      // page & limit are required per Swagger spec
      const res = await api.get('/try-on/history', { params: { page, limit } });
      return (res.data || []) as TryOnResult[];
    },
    enabled: status === 'authenticated',
  });

  return {
    history: query.data || [],
    isLoading: status === 'loading' || query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useDeleteTryOnHistory() {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/try-on/history/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<TryOnResult[]>(['try-on-history'], (old) => {
        if (!old) return [];
        return old.filter(item => item.id !== id);
      });
      queryClient.invalidateQueries({ queryKey: ['quota'] });
    },
  });

  const deleteBulkMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Execute deletions sequentially or via Promise.all if supported
      await Promise.all(ids.map(id => api.delete(`/try-on/history/${id}`)));
      return ids;
    },
    onSuccess: (ids) => {
      queryClient.setQueryData<TryOnResult[]>(['try-on-history'], (old) => {
        if (!old) return [];
        const toDelete = new Set(ids);
        return old.filter(item => !toDelete.has(item.id));
      });
      queryClient.invalidateQueries({ queryKey: ['quota'] });
    },
  });

  return {
    deleteHistoryItem: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    deleteBulkItems: deleteBulkMutation.mutate,
    isBulkDeleting: deleteBulkMutation.isPending,
  };
}
