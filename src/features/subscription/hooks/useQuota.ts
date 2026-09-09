'use client';

import { queryKeys as subscriptionQueryKeys } from '@/features/subscription/services/query-keys';
import { fetchQuota } from '@/features/subscription/services/queries';
import type { AiActionName, UserQuota } from '@/features/subscription/types/quota';
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
