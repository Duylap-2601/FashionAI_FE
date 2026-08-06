'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { formatUserName } from '@/lib/utils';

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

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');

export function useAuth() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';

  const userTier = session?.user?.tier || 'FREE';
  const role: UserRole = session?.user?.role === 'ADMIN' ? 'admin' : (isLoggedIn ? 'user' : 'guest');

  const currentUser: AuthUser = isLoggedIn && session?.user
    ? {
        name: formatUserName(session.user.name || ''),
        email: session.user.email || '',
        role,
        tier: mapTier(userTier),
      }
    : { name: 'Khách', role: 'guest' };

  const login = async (email: string, password?: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const body = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        ok: false,
        error: body?.details?.[0] || body?.message || 'LOGIN_FAILED',
        status: response.status,
      };
    }

    const payload = body?.data ?? body;
    return signIn('backend-session', {
      accessToken: payload.accessToken,
      accessTokenExpiresAt: payload.accessTokenExpiresAt,
      user: JSON.stringify(payload.user),
      redirect: false,
    });
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.user?.accessToken ? { Authorization: `Bearer ${session.user.accessToken}` } : {}),
        },
        credentials: 'include',
      });
    } catch (error) {
      console.warn('Backend logout failed:', error);
    } finally {
      signOut({ redirect: true, callbackUrl: '/' });
    }
  };

  return {
    currentUser,
    isLoggedIn,
    login,
    logout,
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
