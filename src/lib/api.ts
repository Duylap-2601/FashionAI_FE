import { emitAuthInvalidated } from '@/features/auth/services/auth-events';
import { refreshWebSession } from '@/features/auth/services/mutations';
import { fetchCurrentUser } from '@/features/auth/services/queries';
import { API_BASE_URL, AuthClientError, toAuthSession } from '@/features/auth/services/session';
import { useAuthStore } from '@/features/auth/store/authStore';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const baseURL = API_BASE_URL;

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

  const { accessToken, accessTokenExpiresAt } = useAuthStore.getState();
  if (!accessToken) {
    invalidateSessionCache();
    return null;
  }

  cachedToken = accessToken;
  cachedExpiresAt = parseExpiry(accessTokenExpiresAt);
  cachedSessionAt = now;
  return accessToken;
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
      const payload = await refreshWebSession();

      // Web refresh chỉ trả accessToken + accessTokenExpiresAt (không có user,
      // vì user không đổi khi refresh) — chỉ mobile login/register trả user.
      // Trước đây bắt buộc cả payload.user khiến refresh web luôn bị coi là
      // fail dù backend trả 200 hợp lệ, session cũ không bao giờ được cập
      // nhật lại -> user "vẫn thấy đã login" nhưng mọi API đều 401 vô thời hạn.
      if (!payload?.accessToken) {
        invalidateSessionCache();
        return null;
      }

      const currentUser = useAuthStore.getState().user;
      let user = payload.user || currentUser;
      if (!user) {
        user = await fetchCurrentUser(payload.accessToken);
      }

      const session = toAuthSession({ ...payload, user });
      if (session) {
        useAuthStore.getState().setSession(session);
      } else {
        useAuthStore.getState().setAccessToken(payload.accessToken, payload.accessTokenExpiresAt);
      }

      cachedToken = payload.accessToken;
      cachedExpiresAt = parseExpiry(payload.accessTokenExpiresAt);
      cachedSessionAt = Date.now();
      return payload.accessToken;
    } catch (error: unknown) {
      invalidateSessionCache();
      const status = error instanceof AuthClientError ? error.status : undefined;
      if (typeof window !== 'undefined' && (status === 401 || status === 403)) {
        emitAuthInvalidated({ redirectTo: '/login' });
      }
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

function unwrapApiResponse(response: AxiosResponse<unknown>) {
  const body = response.data;
  if (body && typeof body === 'object' && 'data' in body) {
    const envelope = body as { data?: unknown; meta?: unknown };
    response.data = envelope.data;
    if (envelope.meta && response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
      (response.data as Record<string, unknown>).__meta = envelope.meta;
    }
  }
}
