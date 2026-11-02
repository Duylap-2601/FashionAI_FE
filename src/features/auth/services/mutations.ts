import { API_BASE_URL, authRequest } from '@/features/auth/services/session';
import type { AuthPayload, RegisterResponseData, VerifyEmailPayload } from '@/features/auth/types/session';

export async function loginWithPassword(email: string, password?: string) {
  return authRequest<AuthPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// Refresh tokens are single-use on the backend. AuthBootstrap and the 401
// interceptor both refresh right after a page load, so concurrent callers must
// share one request or the loser gets 401 and the session is dropped.
let refreshInFlight: Promise<AuthPayload> | null = null;

export function refreshWebSession() {
  refreshInFlight ??= authRequest<AuthPayload>('/auth/refresh', { method: 'POST' }).finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
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

export async function registerWithPassword(payload: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  return authRequest<RegisterResponseData>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function requestPasswordReset(email: string) {
  return fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, newPassword: string) {
  return fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ token, newPassword }),
  });
}

export function verifyEmail(payload: VerifyEmailPayload) {
  return fetch(`${API_BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
}

export function resendVerification(email: string) {
  return fetch(`${API_BASE_URL}/auth/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });
}

export { mutationKeys } from './mutation-keys';
