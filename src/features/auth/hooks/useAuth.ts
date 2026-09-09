'use client';

import { mapTier, readErrorBody } from '@/features/auth/services/auth-utils';
import type { AuthUser, UserRole } from '@/features/auth/types/auth';
import { loginWithPassword, logoutWebSession } from '@/features/auth/services/mutations';
import { AuthClientError, toAuthSession } from '@/features/auth/services/session';
import { clearAuthMarker, useAuthStore } from '@/features/auth/store/authStore';
import { invalidateSessionCache } from '@/lib/api';
import { formatUserName } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { user, status, accessToken, setSession, clearSession } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const isLoggedIn = status === 'authenticated';

  const userTier = user?.tier || 'FREE';
  const role: UserRole = user?.role === 'ADMIN' ? 'admin' : (isLoggedIn ? 'user' : 'guest');

  const currentUser: AuthUser = isLoggedIn && user
    ? {
      name: formatUserName(user.name || ''),
      email: user.email || '',
      role,
      tier: mapTier(userTier),
      avatar: user.avatarUrl || user.image || undefined,
    }
    : { name: 'Khách', role: 'guest' };

  const login = async (email: string, password?: string) => {
    try {
      const payload = await loginWithPassword(email, password);
      const session = toAuthSession(payload);
      if (!session) {
        return {
          ok: false,
          error: 'LOGIN_FAILED',
          status: 500,
          user: undefined,
        };
      }

      setSession(session);
      invalidateSessionCache();

      return {
        ok: true,
        error: undefined,
        status: 200,
        user: payload.user,
      };
    } catch (err: unknown) {
      const body = readErrorBody(err);
      return {
        ok: false,
        error: body?.details?.[0] || body?.message || 'LOGIN_FAILED',
        status: err instanceof AuthClientError ? err.status : undefined,
        user: undefined,
      };
    }
  };

  const logout = async () => {
    try {
      await logoutWebSession(accessToken);
    } catch (error) {
      console.warn('Backend logout failed:', error);
    } finally {
      clearSession();
      clearAuthMarker();
      invalidateSessionCache();
      queryClient.clear();
      import('@/lib/realtimeSocket')
        .then(({ disconnectAllSockets }) => disconnectAllSockets())
        .catch(() => undefined);
      router.push('/');
    }
  };

  return {
    currentUser,
    isLoggedIn,
    status,
    login,
    logout,
  };
}
