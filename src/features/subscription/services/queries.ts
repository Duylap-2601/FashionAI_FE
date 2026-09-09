import type { AiActionName } from '@/features/subscription/types/quota';
import type { MySubscriptionResponse, PlanItem, SubscriptionHistoryResponse } from '@/features/subscription/types/subscription';
import { api } from '@/lib/api';

export async function fetchQuota(action: AiActionName) {
  const res = await api.get('/users/me/quota', { params: { action } });
  return res.data;
}

export async function fetchPlans() {
  try {
    const res = await api.get('/payments/plans');
    return (res.data || []) as PlanItem[];
  } catch (err) {
    console.warn('Fallback to local plans:', err);
    return [];
  }
}

export async function fetchMySubscription() {
  const res = await api.get('/payments/subscriptions/me');
  return res.data as MySubscriptionResponse;
}

export async function fetchSubscriptionHistory(page: number, limit: number) {
  const res = await api.get('/payments/subscriptions/history', {
    params: { page, limit },
  });
  const data = res.data;
  if (Array.isArray(data)) {
    const meta = (res.data as { __meta?: SubscriptionHistoryResponse['meta'] }).__meta || { total: data.length, page, limit, totalPages: 1 };
    return { items: data, meta };
  }
  return {
    items: data?.items || [],
    meta: data?.meta || { total: 0, page, limit, totalPages: 1 },
  };
}

export { queryKeys } from './query-keys';
