import type { CheckoutRequest, CheckoutResponse } from '@/features/payments/types/payments';
import { http } from '@/lib/http';

export async function checkout(payload: CheckoutRequest): Promise<CheckoutResponse> {
  const body: CheckoutRequest = { provider: payload.provider ?? 'SEPAY' };
  if (payload.orderId) body.orderId = payload.orderId;
  if (payload.targetTier) body.targetTier = payload.targetTier;
  return http.post<CheckoutResponse, CheckoutRequest>('/payments/checkout', body);
}

export { mutationKeys } from './mutation-keys';
