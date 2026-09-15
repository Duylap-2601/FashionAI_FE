import type { TryOnRequest, TryOnResult } from '@/features/try-on/types/try-on';
import type { LiveTryOnEndResponse, LiveTryOnSessionResponse, LiveTryOnSessionStatusResponse } from '@/features/try-on/types/live-try-on';
import { getAuthSnapshot } from '@/features/auth/store/authStore';
import { http } from '@/lib/http';

export async function submitTryOn(payload: TryOnRequest) {
  const formData = new FormData();
  formData.append('humanImage', payload.humanImage);

  if (payload.garments && payload.garments.length > 0) {
    payload.garments.forEach((g, idx) => {
      formData.append(`garments[${idx}][category]`, g.garmentCategory);
      if (g.productId) {
        formData.append(`garments[${idx}][productId]`, g.productId);
      } else if (g.garmentImage) {
        formData.append(`garments[${idx}][image]`, g.garmentImage);
      }
    });
    // Also provide primary fields for backward compatibility
    if (payload.garments[0]?.productId) formData.append('productId', payload.garments[0].productId);
    if (payload.garments[0]?.garmentCategory) formData.append('garmentCategory', payload.garments[0].garmentCategory);
    if (payload.garments[0]?.garmentImage) formData.append('garmentImage', payload.garments[0].garmentImage);
  } else {
    if (payload.garmentImage) formData.append('garmentImage', payload.garmentImage);
    if (payload.productId) formData.append('productId', payload.productId);
    if (payload.garmentCategory) formData.append('garmentCategory', payload.garmentCategory);
  }

  return http.post<TryOnResult, FormData>('/try-on', formData, {
    timeout: 180000,
  });
}

export async function deleteTryOnHistory(id: string) {
  await http.delete(`/try-on/history/${id}`);
  return id;
}

export async function deleteManyTryOnHistory(ids: string[]) {
  // Execute deletions sequentially or via Promise.all if supported
  await Promise.all(ids.map(id => http.delete(`/try-on/history/${id}`)));
  return ids;
}

export async function createLiveTryOnSession(productId: string, idempotencyKey: string, signal?: AbortSignal) {
  return http.post<LiveTryOnSessionResponse, { productId: string }>('/try-on/live/sessions', { productId }, {
    headers: { 'Idempotency-Key': idempotencyKey },
    signal,
  });
}

export async function endLiveTryOnSession(sessionId: string, reason = 'client_end') {
  return http.post<LiveTryOnEndResponse, { reason: string }>(`/try-on/live/sessions/${sessionId}/end`, { reason });
}

export async function pauseLiveTryOnSession(sessionId: string, reason = 'client_pause') {
  return http.post<LiveTryOnSessionStatusResponse, { reason: string }>(`/try-on/live/sessions/${sessionId}/pause`, { reason });
}

export function pauseLiveTryOnSessionKeepalive(sessionId: string, reason = 'pagehide') {
  const { accessToken } = getAuthSnapshot();
  if (!accessToken) return;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/backend';
  void fetch(`${baseUrl}/try-on/live/sessions/${sessionId}/pause`, {
    method: 'POST',
    keepalive: true,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  }).catch(() => undefined);
}

export async function resumeLiveTryOnSession(sessionId: string, productId?: string) {
  return http.post<LiveTryOnSessionResponse, { productId?: string }>(`/try-on/live/sessions/${sessionId}/resume`, productId ? { productId } : {});
}

export function endLiveTryOnSessionKeepalive(sessionId: string, reason = 'pagehide') {
  const { accessToken } = getAuthSnapshot();
  if (!accessToken) return;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/backend';
  void fetch(`${baseUrl}/try-on/live/sessions/${sessionId}/end`, {
    method: 'POST',
    keepalive: true,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  }).catch(() => undefined);
}

export { mutationKeys } from './mutation-keys';
