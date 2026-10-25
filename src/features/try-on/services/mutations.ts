import type { TryOnRequest, TryOnResult } from '@/features/try-on/types/try-on';
import type { LiveTryOnEndResponse, LiveTryOnGarment, LiveTryOnSessionItem, LiveTryOnSessionResponse, LiveTryOnSessionStatusResponse } from '@/features/try-on/types/live-try-on';
import { getAuthSnapshot } from '@/features/auth/store/authStore';
import { http } from '@/lib/http';
import { getValidAccessToken } from '@/lib/api';

export async function submitTryOn(payload: TryOnRequest) {
  const formData = new FormData();
  formData.append('humanImage', payload.humanImage);

  if (payload.garments && payload.garments.length > 0) {
    payload.garments.forEach((g, idx) => {
      formData.append(`garments[${idx}][category]`, g.garmentCategory);
      if (g.layerRole) {
        formData.append(`garments[${idx}][layerRole]`, g.layerRole);
      } else if (!g.productId && g.garmentImage) {
        formData.append(`garments[${idx}][layerRole]`, 'INNER');
      }
      if (g.productId) {
        formData.append(`garments[${idx}][productId]`, g.productId);
        if (g.color) {
          formData.append(`garments[${idx}][color]`, g.color);
        }
      } else if (g.garmentImage) {
        formData.append(`garments[${idx}][image]`, g.garmentImage);
      }
    });
    // Also provide primary fields for backward compatibility
    if (payload.garments[0]?.productId) formData.append('productId', payload.garments[0].productId);
    if (payload.garments[0]?.garmentCategory) formData.append('garmentCategory', payload.garments[0].garmentCategory);
    if (payload.garments[0]?.garmentImage) formData.append('garmentImage', payload.garments[0].garmentImage);
    const primaryRole = payload.garments[0]?.layerRole || payload.layerRole;
    if (primaryRole) formData.append('layerRole', primaryRole);
    const primaryColor = payload.garments[0]?.color || payload.color;
    if (primaryColor) formData.append('color', primaryColor);
  } else {
    if (payload.garmentImage) formData.append('garmentImage', payload.garmentImage);
    if (payload.productId) formData.append('productId', payload.productId);
    if (payload.garmentCategory) formData.append('garmentCategory', payload.garmentCategory);
    if (payload.layerRole) {
      formData.append('layerRole', payload.layerRole);
    } else if (payload.garmentImage && !payload.productId) {
      formData.append('layerRole', 'INNER');
    }
    if (payload.color) formData.append('color', payload.color);
  }

  // In browser, use raw fetch directly to /api/try-on —
  // the dedicated Next.js route handler with a 5-minute maxDuration.
  // In non-browser / test environments, use http.post('/try-on').
  if (typeof window !== 'undefined' && typeof fetch === 'function') {
    const accessToken = await getValidAccessToken();

    const ac = new AbortController();
    const timeoutId = setTimeout(() => ac.abort(), 290_000); // 4m50s client guard

    try {
      const res = await fetch('/api/try-on', {
        method: 'POST',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        body: formData,
        signal: ac.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw Object.assign(new Error(err?.message ?? 'Try-on failed'), { status: res.status, data: err });
      }

      // Unwrap backend envelope: { data: TryOnResult } or TryOnResult directly
      const json = await res.json() as { data?: TryOnResult } | TryOnResult;
      return ('data' in json && json.data !== undefined ? json.data : json) as TryOnResult;
    } finally {
      clearTimeout(timeoutId);
    }
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

export async function createLiveTryOnSession(
  items: LiveTryOnSessionItem[] | string,
  idempotencyKey: string,
  signal?: AbortSignal,
  color?: string,
) {
  const body = Array.isArray(items)
    ? { items }
    : { productId: items, ...(color ? { color } : {}) };
  return http.post<LiveTryOnSessionResponse, typeof body>('/try-on/live/sessions', body, {
    headers: { 'Idempotency-Key': idempotencyKey },
    signal,
  });
}

export async function previewLiveTryOnGarment(
  items: LiveTryOnSessionItem[],
  signal?: AbortSignal,
): Promise<LiveTryOnGarment> {
  const res = await http.post<{ garment: LiveTryOnGarment } | LiveTryOnGarment, { items: LiveTryOnSessionItem[] }>(
    '/try-on/live/garments/preview',
    { items },
    { signal },
  );
  return res && typeof res === 'object' && 'garment' in res && res.garment ? res.garment : (res as LiveTryOnGarment);
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

export async function resumeLiveTryOnSession(sessionId: string, productId?: string, color?: string) {
  const body: { productId?: string; color?: string } = {};
  if (productId) body.productId = productId;
  if (color) body.color = color;
  return http.post<LiveTryOnSessionResponse, { productId?: string; color?: string }>(`/try-on/live/sessions/${sessionId}/resume`, body);
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
