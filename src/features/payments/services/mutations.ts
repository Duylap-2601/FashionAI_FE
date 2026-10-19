import type { CheckoutRequest, CheckoutResponse } from '@/features/payments/types/payments';
import { http } from '@/lib/http';

export async function checkout(payload: CheckoutRequest): Promise<CheckoutResponse> {
  const body: CheckoutRequest = {};
  if (payload.provider) body.provider = payload.provider;
  if (payload.orderId) body.orderId = payload.orderId;
  if (payload.targetTier) body.targetTier = payload.targetTier;
  if (payload.gaClientId) body.gaClientId = payload.gaClientId;
  if (payload.gaClientId && payload.gaSessionId) body.gaSessionId = payload.gaSessionId;
  return http.post<CheckoutResponse, CheckoutRequest>('/payments/checkout', body);
}

export { mutationKeys } from './mutation-keys';
