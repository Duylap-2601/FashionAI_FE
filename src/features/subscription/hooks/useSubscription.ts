'use client';

import { mutationKeys } from '@/features/subscription/services/mutation-keys';
import { queryKeys as subscriptionQueryKeys } from '@/features/subscription/services/query-keys';
import { cancelSubscription, resumeSubscription } from '@/features/subscription/services/mutations';
import { fetchMySubscription, fetchPlans, fetchSubscriptionHistory } from '@/features/subscription/services/queries';
import type { MySubscriptionResponse, PlanItem, SubscriptionHistoryResponse } from '@/features/subscription/types/subscription';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * GET /api/payments/plans - Danh sách gói & giá (public)
 */
export function usePlans() {
  const query = useQuery<PlanItem[]>({
    queryKey: subscriptionQueryKeys.subscriptionPlans(),
    queryFn: fetchPlans,
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
  const status = useAuthStore((state) => state.status);

  const query = useQuery<MySubscriptionResponse>({
    queryKey: subscriptionQueryKeys.subscriptionMe(),
    queryFn: fetchMySubscription,
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
  const status = useAuthStore((state) => state.status);

  const query = useQuery<SubscriptionHistoryResponse>({
    queryKey: subscriptionQueryKeys.subscriptionHistory(page, limit),
    queryFn: () => fetchSubscriptionHistory(page, limit),
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
    mutationKey: mutationKeys.cancelSubscription(),
    mutationFn: cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptionMe() });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptionHistory() });
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
    mutationKey: mutationKeys.resumeSubscription(),
    mutationFn: resumeSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptionMe() });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.subscriptionHistory() });
    },
  });

  return {
    resumeSubscription: mutation.mutateAsync,
    isResuming: mutation.isPending,
    error: mutation.error,
  };
}
