import { http } from '@/lib/http';
import type { CancelScheduledSubscriptionResponse } from '@/features/subscription/types/subscription';

export async function cancelSubscription() {
  return http.post('/payments/subscriptions/cancel');
}

export async function resumeSubscription() {
  return http.post('/payments/subscriptions/resume');
}

export async function cancelScheduledSubscription(): Promise<CancelScheduledSubscriptionResponse> {
  return http.post<CancelScheduledSubscriptionResponse>('/payments/subscriptions/scheduled/cancel');
}

export { mutationKeys } from './mutation-keys';
