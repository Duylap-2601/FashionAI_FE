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
let cachedExpiresAt: number | null = null;
let cachedSessionAt = 0;
const SESSION_TTL = 30 * 1000; // 30s
// Refresh sớm hơn thời điểm token chết, để request đang bay không rơi vào 401
// rồi mới phải retry. Cũng bù cho lệch giờ giữa máy client và server.
const EXPIRY_SKEW = 60 * 1000; // 60s

function parseExpiry(value: unknown): number | null {
  if (typeof value !== 'string' || !value) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

async function readSessionToken(): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && now - cachedSessionAt < SESSION_TTL) {
    return cachedToken;
  }

  try {
    const session = await getSession();
    const user = session?.user as any;
    const token = user?.accessToken || null;
    if (!token) {
      invalidateSessionCache();
      return null;
    }
    cachedToken = token;
    cachedExpiresAt = parseExpiry(user?.accessTokenExpiresAt);
    cachedSessionAt = now;
    return token;
  } catch {
    invalidateSessionCache();
    return null;
  }
}

/**
 * Access token đã đảm bảo còn hiệu lực. Dùng cho cả axios và những chỗ gọi
 * fetch thẳng (SSE, streaming) — vì các chỗ đó không đi qua interceptor.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const token = await readSessionToken();
  if (!token) return null;

  // expiry null = session được tạo trước khi FE lưu accessTokenExpiresAt. Cứ
  // dùng token đang có và để nhánh xử lý 401 lo phần refresh.
  if (cachedExpiresAt === null || cachedExpiresAt - Date.now() > EXPIRY_SKEW) {
    return token;
  }

  return (await doRefreshToken()) ?? token;
}

export function invalidateSessionCache() {
  cachedToken = null;
  cachedExpiresAt = null;
  cachedSessionAt = 0;
}

// ─── Request Interceptor ───────────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const accessToken = await getValidAccessToken();
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
      cachedExpiresAt = parseExpiry(payload.accessTokenExpiresAt);
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
