'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type AiActionName = 'TRY_ON' | 'STYLIST' | 'CHATBOT';

export interface UserQuota {
  action?: AiActionName;
  used: number;
  limit: number | null;
  unlimited?: boolean;
  remaining?: number | null;
  tier: 'FREE' | 'MEMBER' | 'VIP' | 'free' | 'member' | 'vip' | 'admin';
  resetAt?: string;
  resetsAt?: string;
  limits?: Record<
    AiActionName,
    { label: string; limit: number | null; unlimited: boolean }
  >;
}

export function useQuota(action: AiActionName = 'TRY_ON') {
  const query = useQuery<UserQuota>({
    queryKey: ['quota', action],
    queryFn: async () => {
      const res = await api.get('/users/me/quota', { params: { action } });
      return res.data;
    },
  });

  return {
    quota: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
