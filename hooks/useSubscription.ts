'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

export type SubscriptionTier = 'FREE' | 'MEMBER' | 'VIP';

export type SubscriptionStatus = 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'CANCELLED';

export interface PlanQuota {
  action: 'TRY_ON' | 'STYLIST' | 'CHATBOT' | string;
  label: string;
  limit: number | null;
  unlimited: boolean;
}

export interface PlanItem {
  tier: SubscriptionTier;
  label: string;
  price: number;
  durationDays: number;
  quotas: PlanQuota[];
}

export interface SubscriptionDetail {
  id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  autoRenew: boolean;
  startsAt: string;
  expiresAt: string;
  daysRemaining: number;
  order?: {
    orderCode: number;
    amount: number;
    createdAt?: string;
  };
}

export interface MySubscriptionResponse {
  tier: SubscriptionTier;
  tierExpiresAt: string | null;
  isFree: boolean;
  current: SubscriptionDetail | null;
  scheduled: SubscriptionDetail | null;
}

export interface SubscriptionHistoryItem {
  id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  autoRenew: boolean;
  startsAt: string;
  expiresAt: string;
  createdAt: string;
  order?: {
    orderCode: number;
    amount: number;
    createdAt?: string;
  };
}

export interface SubscriptionHistoryResponse {
  items: SubscriptionHistoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * GET /api/payments/plans - Danh sách gói & giá (public)
 */
export function usePlans() {
  const query = useQuery<PlanItem[]>({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      try {
        const res = await api.get('/payments/plans');
        return (res.data || []) as PlanItem[];
      } catch (err) {
        console.warn('Fallback to local plans:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    plans: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/**
 * GET /api/payments/subscriptions/me - Gói hiện tại của user (requires login)
 */
export function useMySubscription() {
  const { status } = useSession();

  const query = useQuery<MySubscriptionResponse>({
    queryKey: ['subscription-me'],
    queryFn: async () => {
      const res = await api.get('/payments/subscriptions/me');
      return res.data as MySubscriptionResponse;
    },
    enabled: status === 'authenticated',
  });

  return {
    subscription: query.data,
    current: query.data?.current || null,
    scheduled: query.data?.scheduled || null,
    tier: query.data?.tier || 'FREE',
    tierExpiresAt: query.data?.tierExpiresAt || null,
    isFree: query.data?.isFree ?? true,
    isLoading: status === 'loading' || query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/**
 * GET /api/payments/subscriptions/history - Lịch sử gói đăng ký (requires login)
 */
export function useSubscriptionHistory(page = 1, limit = 10) {
  const { status } = useSession();

  const query = useQuery<SubscriptionHistoryResponse>({
    queryKey: ['subscription-history', page, limit],
    queryFn: async () => {
      const res = await api.get('/payments/subscriptions/history', {
        params: { page, limit },
      });
      const data = res.data;
      if (Array.isArray(data)) {
        const meta = (res.data as any)?.__meta || { total: data.length, page, limit, totalPages: 1 };
        return { items: data, meta };
      }
      return {
        items: data?.items || [],
        meta: data?.meta || { total: 0, page, limit, totalPages: 1 },
      };
    },
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

/**
 * POST /api/payments/subscriptions/cancel - Tắt tự động gia hạn (nhắc thanh toán)
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/payments/subscriptions/cancel');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-me'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-history'] });
    },
  });

  return {
    cancelSubscription: mutation.mutateAsync,
    isCancelling: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * POST /api/payments/subscriptions/resume - Bật lại tự động gia hạn (nhắc thanh toán)
 */
export function useResumeSubscription() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/payments/subscriptions/resume');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-me'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-history'] });
    },
  });

  return {
    resumeSubscription: mutation.mutateAsync,
    isResuming: mutation.isPending,
    error: mutation.error,
  };
}
