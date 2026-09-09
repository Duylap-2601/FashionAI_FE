import { API_BASE_URL, authRequest } from '@/features/auth/services/session';
import type { AuthPayload } from '@/features/auth/types/session';

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

export function verifyEmail(token: string) {
  return fetch(`${API_BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ token }),
  });
}

export { mutationKeys } from './mutation-keys';
