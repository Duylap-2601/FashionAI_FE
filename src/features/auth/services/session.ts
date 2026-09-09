import { normalizeAuthUser } from '@/features/auth/store/authStore';
import type { AuthSession, RawAuthUser } from '@/features/auth/types/auth-store';
import type { ApiEnvelope, AuthPayload } from '@/features/auth/types/session';

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '/api/backend').replace(/\/$/, '');

export class AuthClientError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly data?: unknown,
  ) {
    super(message);
    this.name = 'AuthClientError';
  }
}

export function unwrapApiData<T>(body: unknown): T {
  if (isRecord(body) && 'data' in body) {
    return (body as ApiEnvelope<T>).data as T;
  }
  return body as T;
}

export function toAuthSession(payload: AuthPayload, fallbackUser?: RawAuthUser | null): AuthSession | null {
  const user = payload.user || fallbackUser;
  const accessToken = payload.accessToken;
  if (!user || !accessToken) return null;

  return {
    user: normalizeAuthUser(user),
    accessToken,
    accessTokenExpiresAt: payload.accessTokenExpiresAt || readUserExpiry(user),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readUserExpiry(user: RawAuthUser) {
  const value = user.accessTokenExpiresAt;
  return typeof value === 'string' ? value : null;
}

export async function authRequest<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });
  const body = await response.json().catch(() => null) as unknown;

  if (!response.ok) {
    throw new AuthClientError(readErrorMessage(body) || response.statusText, response.status, body);
  }

  return unwrapApiData<T>(body);
}

function readErrorMessage(body: unknown) {
  if (!isRecord(body)) return null;
  const message = body.message;
  return typeof message === 'string' ? message : null;
}
