'use client';

import { queryKeys as subscriptionQueryKeys } from '@/features/subscription/services/query-keys';
import { mutationKeys } from '@/features/try-on/services/mutation-keys';
import { queryKeys as tryOnQueryKeys } from '@/features/try-on/services/query-keys';
import { deleteTryOnHistory, deleteManyTryOnHistory, submitTryOn } from '@/features/try-on/services/mutations';
import { fetchTryOnHistory } from '@/features/try-on/services/queries';
import type { TryOnResult } from '@/features/try-on/types/try-on';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useTryOn() {
  const queryClient = useQueryClient();

  const tryOnMutation = useMutation({
    mutationKey: mutationKeys.submitTryOn(),
    mutationFn: submitTryOn,
    onSuccess: () => {
      // Invalidate history and quota
      queryClient.invalidateQueries({ queryKey: tryOnQueryKeys.tryOnHistory() });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.quota() });
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
  const status = useAuthStore((state) => state.status);
  const query = useQuery<TryOnResult[]>({
    queryKey: tryOnQueryKeys.tryOnHistory(page, limit),
    queryFn: () => fetchTryOnHistory(page, limit),
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
    mutationKey: mutationKeys.deleteTryOnHistory(),
    mutationFn: deleteTryOnHistory,
    onSuccess: (id) => {
      queryClient.setQueryData<TryOnResult[]>(tryOnQueryKeys.tryOnHistory(), (old) => {
        if (!old) return [];
        return old.filter(item => item.id !== id);
      });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.quota() });
    },
  });

  const deleteBulkMutation = useMutation({
    mutationKey: mutationKeys.deleteManyTryOnHistory(),
    mutationFn: deleteManyTryOnHistory,
    onSuccess: (ids) => {
      queryClient.setQueryData<TryOnResult[]>(tryOnQueryKeys.tryOnHistory(), (old) => {
        if (!old) return [];
        const toDelete = new Set(ids);
        return old.filter(item => !toDelete.has(item.id));
      });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.quota() });
    },
  });

  return {
    deleteHistoryItem: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    deleteBulkItems: deleteBulkMutation.mutate,
    isBulkDeleting: deleteBulkMutation.isPending,
  };
}
