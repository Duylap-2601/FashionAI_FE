import { api } from '@/lib/api';

export async function cancelSubscription() {
  const res = await api.post('/payments/subscriptions/cancel');
  return res.data;
}

export async function resumeSubscription() {
  const res = await api.post('/payments/subscriptions/resume');
  return res.data;
}

export { mutationKeys } from './mutation-keys';
