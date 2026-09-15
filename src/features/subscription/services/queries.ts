import type { AiActionName, UserQuota } from '@/features/subscription/types/quota';
import type { LiveTryOnQuota } from '@/features/subscription/types/live-try-on-quota';
import type { MySubscriptionResponse, PlanItem, SubscriptionHistoryItem, SubscriptionHistoryResponse } from '@/features/subscription/types/subscription';
import { http } from '@/lib/http';

export async function fetchQuota(action: AiActionName): Promise<UserQuota> {
  return http.get<UserQuota>('/users/me/quota', { params: { action } });
}

export async function fetchLiveTryOnQuota(): Promise<LiveTryOnQuota> {
  return http.get<LiveTryOnQuota>('/try-on/live/quota');
}

export async function fetchPlans() {
  try {
    const data = await http.get<PlanItem[]>('/payments/plans');
    return data || [];
  } catch (err) {
    console.warn('Fallback to local plans:', err);
    return [];
  }
}

export async function fetchMySubscription() {
  return http.get<MySubscriptionResponse>('/payments/subscriptions/me');
}

export async function fetchSubscriptionHistory(page: number, limit: number): Promise<SubscriptionHistoryResponse> {
  const data = await http.get<(SubscriptionHistoryItem[] & { __meta?: SubscriptionHistoryResponse['meta'] }) | SubscriptionHistoryResponse>('/payments/subscriptions/history', {
    params: { page, limit },
  });
  if (Array.isArray(data)) {
    const meta = data.__meta || { total: data.length, page, limit, totalPages: 1 };
    return { items: data, meta };
  }
  return {
    items: data?.items || [],
    meta: data?.meta || { total: 0, page, limit, totalPages: 1 },
  };
}

export { queryKeys } from './query-keys';
