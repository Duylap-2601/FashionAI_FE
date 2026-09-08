import { normalizeAuthUser, AuthSession, RawAuthUser } from '@/store/authStore';

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '/api/backend').replace(/\/$/, '');

export interface AuthPayload {
  user?: RawAuthUser;
  accessToken?: string;
  accessTokenExpiresAt?: string | null;
  refreshToken?: string;
  refreshTokenExpiresAt?: string | null;
}

interface ApiEnvelope<T> {
  data?: T;
}

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

export async function loginWithPassword(email: string, password?: string) {
  return authRequest<AuthPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function refreshWebSession() {
  return authRequest<AuthPayload>('/auth/refresh', { method: 'POST' });
}

export async function logoutWebSession(accessToken?: string | null) {
  await authRequest<unknown>('/auth/logout', {
    method: 'POST',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    body: JSON.stringify({}),
  });
}

export async function exchangeAuthCode(code: string) {
  return authRequest<AuthPayload>('/auth/exchange', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function fetchCurrentUser(accessToken?: string | null) {
  return authRequest<RawAuthUser>('/users/me', {
    method: 'GET',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
}

export async function registerWithPassword(payload: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  return authRequest<AuthPayload>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readUserExpiry(user: RawAuthUser) {
  const value = user.accessTokenExpiresAt;
  return typeof value === 'string' ? value : null;
}

async function authRequest<T>(path: string, init: RequestInit = {}) {
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
