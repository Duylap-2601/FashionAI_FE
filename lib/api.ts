import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getSession, signIn } from 'next-auth/react';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const api = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
});

// ─── Session token cache ────────────────────────────────────────────────────
// Tránh gọi getSession() (1 network round-trip tới /api/auth/session) trên
// MỖI request. Nhiều request song song sẽ dùng chung 1 lần fetch duy nhất.
let cachedSessionPromise: Promise<string | null> | null = null;
let cachedSessionAt = 0;
const SESSION_TTL = 60 * 1000; // 60s

async function getAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (cachedSessionPromise && now - cachedSessionAt < SESSION_TTL) {
    return cachedSessionPromise;
  }

  cachedSessionAt = now;
  cachedSessionPromise = (async () => {
    const session = await getSession();
    return (session?.user as any)?.accessToken || null;
  })();

  return cachedSessionPromise;
}

function invalidateSessionCache() {
  cachedSessionPromise = null;
  cachedSessionAt = 0;
}

api.interceptors.request.use(async (config) => {
  const accessToken = await getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  unwrapApiResponse(response);
  return response;
}, async (error: AxiosError) => {
  const originalRequest = error.config as RetriableRequestConfig | undefined;
  const status = error.response?.status;
  const url = originalRequest?.url || '';

  if (!originalRequest || status !== 401 || originalRequest._retry || url.includes('/auth/refresh')) {
    return Promise.reject(error);
  }

  originalRequest._retry = true;

  try {
    // Dùng cookie-based refresh: không gửi body, browser tự đính kèm refresh token cookie
    const refreshRes = await fetch(`${baseURL.replace(/\/$/, '')}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // gửi cookie, không set body hay Content-Type
    });

    if (!refreshRes.ok) {
      invalidateSessionCache();
      return Promise.reject(error);
    }

    const body = await refreshRes.json().catch(() => null);
    const payload = body?.data ?? body;

    if (!payload?.accessToken || !payload?.user) {
      invalidateSessionCache();
      return Promise.reject(error);
    }

    await signIn('backend-session', {
      accessToken: payload.accessToken,
      accessTokenExpiresAt: payload.accessTokenExpiresAt,
      user: JSON.stringify(payload.user),
      redirect: false,
    });

    invalidateSessionCache();
    originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`;
    return api(originalRequest);
  } catch (refreshError) {
    invalidateSessionCache();
    return Promise.reject(refreshError);
  }
});

function unwrapApiResponse(response: any) {
  const body = response.data;
  if (body && typeof body === 'object' && 'data' in body) {
    response.data = body.data;
    if (body.meta && response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
      response.data.__meta = body.meta;
    }
  }
}
