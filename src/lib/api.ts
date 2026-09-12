import { emitAuthInvalidated } from '@/features/auth/services/auth-events';
import { refreshWebSession } from '@/features/auth/services/mutations';
import { fetchCurrentUser } from '@/features/auth/services/queries';
import { API_BASE_URL, AuthClientError, toAuthSession } from '@/features/auth/services/session';
import { useAuthStore } from '@/features/auth/store/authStore';
import axios from 'axios';
import { setupApiInterceptors } from '@/lib/api-interceptors';

const baseURL = API_BASE_URL;

export const publicApi = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
});

export const api = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
});

// Session token cache used by axios and realtime flows.
let cachedToken: string | null = null;
let cachedExpiresAt: number | null = null;
let cachedSessionAt = 0;
const SESSION_TTL = 30 * 1000;
const EXPIRY_SKEW = 60 * 1000;

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

export async function getValidAccessToken(): Promise<string | null> {
  const token = await readSessionToken();
  if (!token) return null;

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

let refreshPromise: Promise<string | null> | null = null;

async function doRefreshToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const payload = await refreshWebSession();

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

setupApiInterceptors({
  api,
  publicApi,
  getValidAccessToken,
  refreshAccessToken: doRefreshToken,
  invalidateSessionCache,
});
