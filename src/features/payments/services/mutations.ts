import type { CheckoutRequest, CheckoutResponse } from '@/features/payments/types/payments';
import { api } from '@/lib/api';

export async function checkout(payload: CheckoutRequest): Promise<CheckoutResponse> {
  const body: CheckoutRequest = { provider: payload.provider ?? 'SEPAY' };
  if (payload.orderId) body.orderId = payload.orderId;
  if (payload.targetTier) body.targetTier = payload.targetTier;
  const res = await api.post('/payments/checkout', body);
  return res.data as CheckoutResponse;
}

export { mutationKeys } from './mutation-keys';
