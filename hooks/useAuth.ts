'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AuthClientError, loginWithPassword, logoutWebSession, toAuthSession } from '@/lib/authClient';
import { formatUserName } from '@/lib/utils';
import { clearAuthMarker, useAuthStore } from '@/store/authStore';
import { invalidateSessionCache } from '@/lib/api';

export type UserRole = 'guest' | 'user' | 'admin';
export type UserTier = 'free' | 'member' | 'vip';

export interface AuthUser {
  name: string;
  email?: string;
  role: UserRole;
  tier?: UserTier;
  avatar?: string;
  quota?: number;
}

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

function readErrorBody(error: unknown): { message?: string; details?: string[] } | undefined {
  if (!(error instanceof AuthClientError)) return undefined;
  const data = error.data;
  if (!data || typeof data !== 'object') return undefined;
  const record = data as Record<string, unknown>;
  return {
    message: typeof record.message === 'string' ? record.message : undefined,
    details: Array.isArray(record.details) && record.details.every((item) => typeof item === 'string')
      ? record.details
      : undefined,
  };
}

function mapTier(tier: 'FREE' | 'MEMBER' | 'VIP'): UserTier {
  switch (tier) {
    case 'MEMBER':
      return 'member';
    case 'VIP':
      return 'vip';
    case 'FREE':
    default:
      return 'free';
  }
}
