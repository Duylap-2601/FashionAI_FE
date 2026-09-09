import { authRequest } from '@/features/auth/services/session';
import type { RawAuthUser } from '@/features/auth/types/auth-store';

export async function fetchCurrentUser(accessToken?: string | null) {
  return authRequest<RawAuthUser>('/users/me', {
    method: 'GET',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
}
