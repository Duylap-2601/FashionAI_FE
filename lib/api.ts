import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getSession, signIn, signOut } from 'next-auth/react';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const api = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
});

// ─── Session token cache ────────────────────────────────────────────────────
let cachedToken: string | null = null;
let cachedSessionAt = 0;
const SESSION_TTL = 30 * 1000; // 30s

async function getAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && now - cachedSessionAt < SESSION_TTL) {
    return cachedToken;
  }

  try {
    const session = await getSession();
    const token = (session?.user as any)?.accessToken || null;
    if (token) {
      cachedToken = token;
      cachedSessionAt = now;
      return token;
    } else {
      cachedToken = null;
      cachedSessionAt = 0;
      return null;
    }
  } catch {
    cachedToken = null;
    cachedSessionAt = 0;
    return null;
  }
}

export function invalidateSessionCache() {
  cachedToken = null;
  cachedSessionAt = 0;
}

// ─── Request Interceptor ───────────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const accessToken = await getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─── Single-flight Refresh Handler ──────────────────────────────────────────
let refreshPromise: Promise<string | null> | null = null;

async function doRefreshToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshRes = await fetch(`${baseURL.replace(/\/$/, '')}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!refreshRes.ok) {
        invalidateSessionCache();
        // If refresh fails with 401/403, sign out to prevent infinite 401 loops
        if (typeof window !== 'undefined' && (refreshRes.status === 401 || refreshRes.status === 403)) {
          signOut({ redirect: true, callbackUrl: '/login' });
        }
        return null;
      }

      const body = await refreshRes.json().catch(() => null);
      const payload = body?.data ?? body;

      if (!payload?.accessToken || !payload?.user) {
        invalidateSessionCache();
        return null;
      }

      await signIn('backend-session', {
        accessToken: payload.accessToken,
        accessTokenExpiresAt: payload.accessTokenExpiresAt,
        user: JSON.stringify(payload.user),
        redirect: false,
      });

      cachedToken = payload.accessToken;
      cachedSessionAt = Date.now();
      return payload.accessToken;
    } catch {
      invalidateSessionCache();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Response Interceptor ──────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    unwrapApiResponse(response);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    if (
      !originalRequest ||
      status !== 401 ||
      originalRequest._retry ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/login')
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await doRefreshToken();
      if (!newAccessToken) {
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      invalidateSessionCache();
      return Promise.reject(refreshError);
    }
  }
);

function unwrapApiResponse(response: any) {
  const body = response.data;
  if (body && typeof body === 'object' && 'data' in body) {
    response.data = body.data;
    if (body.meta && response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
      response.data.__meta = body.meta;
    }
  }
}
