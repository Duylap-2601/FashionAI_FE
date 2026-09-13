import { http } from '@/lib/http';

export async function cancelSubscription() {
  return http.post('/payments/subscriptions/cancel');
}

export async function resumeSubscription() {
  return http.post('/payments/subscriptions/resume');
}

export { mutationKeys } from './mutation-keys';
