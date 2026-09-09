'use client';

import { mutationKeys } from '@/features/stylist/services/mutation-keys';
import { queryKeys as stylistQueryKeys } from '@/features/stylist/services/query-keys';
import { queryKeys as subscriptionQueryKeys } from '@/features/subscription/services/query-keys';
import { analyzeStylist, deleteStylistHistory } from '@/features/stylist/services/mutations';
import { fetchStylistHistory } from '@/features/stylist/services/queries';
import { extractErrorMessage } from '@/features/stylist/services/stylist-utils';
import type { StylistHistoryMeta, StylistResult } from '@/features/stylist/types/stylist';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useAnalyzeStylist() {
  const queryClient = useQueryClient();

  const analyzeMutation = useMutation({
    mutationKey: mutationKeys.analyzeStylist(),
    mutationFn: analyzeStylist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stylistQueryKeys.stylistHistory() });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.quota('STYLIST') });
    },
  });

  return {
    analyze: analyzeMutation.mutate,
    analyzeAsync: analyzeMutation.mutateAsync,
    isAnalyzing: analyzeMutation.isPending,
    error: analyzeMutation.error,
    errorMessage: analyzeMutation.error
      ? extractErrorMessage(analyzeMutation.error)
      : null,
    reset: analyzeMutation.reset,
  };
}

export function useStylistHistory(page = 1, pageSize = 20) {
  const status = useAuthStore((state) => state.status);
  const query = useQuery<{ items: StylistResult[]; meta: StylistHistoryMeta }>({
    queryKey: stylistQueryKeys.stylistHistory(page, pageSize),
    queryFn: () => fetchStylistHistory(page, pageSize),
    enabled: status === 'authenticated',
  });

  return {
    history: query.data?.items || [],
    meta: query.data?.meta,
    isLoading: status === 'loading' || query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useDeleteStylistHistory() {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationKey: mutationKeys.deleteStylistHistory(),
    mutationFn: deleteStylistHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stylistQueryKeys.stylistHistory() });
    },
  });

  return {
    deleteHistoryItem: deleteMutation.mutate,
    deleteAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
