'use client';

import { queryKeys as subscriptionQueryKeys } from '@/features/subscription/services/query-keys';
import { fetchQuota } from '@/features/subscription/services/queries';
import { fetchLiveTryOnQuota } from '@/features/subscription/services/queries';
import type { AiActionName, UserQuota } from '@/features/subscription/types/quota';
import type { LiveTryOnQuota } from '@/features/subscription/types/live-try-on-quota';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useQuery } from '@tanstack/react-query';

export function useQuota(action: AiActionName = 'TRY_ON') {
  const status = useAuthStore((state) => state.status);

  const query = useQuery<UserQuota>({
    queryKey: subscriptionQueryKeys.quota(action),
    queryFn: () => fetchQuota(action),
    enabled: status === 'authenticated',
  });

  return {
    quota: query.data,
    isLoading: status === 'loading' || query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useLiveTryOnQuota() {
  const status = useAuthStore((state) => state.status);
  const query = useQuery<LiveTryOnQuota>({
    queryKey: subscriptionQueryKeys.quota('LIVE_TRY_ON'),
    queryFn: fetchLiveTryOnQuota,
    enabled: status === 'authenticated',
  });

  return {
    quota: query.data,
    isLoading: status === 'loading' || query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
