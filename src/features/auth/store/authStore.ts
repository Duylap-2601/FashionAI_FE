import type { AuthState, AuthUser, RawAuthUser } from '@/features/auth/types/auth-store';
import { create } from 'zustand';

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  user: null,
  accessToken: null,
  accessTokenExpiresAt: null,
  setLoading: () => set({ status: 'loading' }),
  setSession: (session) =>
    set({
      status: 'authenticated',
      user: normalizeAuthUser(session.user),
      accessToken: session.accessToken,
      accessTokenExpiresAt: session.accessTokenExpiresAt || null,
    }),
  setAccessToken: (accessToken, accessTokenExpiresAt = null) => {
    const { user } = get();
    set({
      status: user ? 'authenticated' : 'loading',
      accessToken,
      accessTokenExpiresAt,
    });
  },
  clearSession: () =>
    set({
      status: 'unauthenticated',
      user: null,
      accessToken: null,
      accessTokenExpiresAt: null,
    }),
}));

export function normalizeAuthUser(raw: RawAuthUser): AuthUser {
  return {
    id: readString(raw.id) || readString(raw._id),
    name: readString(raw.name) || readString(raw.fullName),
    email: readString(raw.email),
    image: readNullableString(raw.image) || readNullableString(raw.avatarUrl),
    avatarUrl: readNullableString(raw.avatarUrl) || readNullableString(raw.image),
    role: raw?.role === 'ADMIN' ? 'ADMIN' : 'USER',
    tier: raw?.tier === 'VIP' ? 'VIP' : raw?.tier === 'MEMBER' ? 'MEMBER' : 'FREE',
    tierExpiresAt: readNullableString(raw.tierExpiresAt),
  };
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function readNullableString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

export function getAuthSnapshot() {
  return useAuthStore.getState();
}

export function hasAuthMarker() {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((part) => part.trim().startsWith('auth_marker='));
}

export function clearAuthMarker() {
  if (typeof document === 'undefined') return;
  document.cookie = 'auth_marker=; Max-Age=0; Path=/; SameSite=Lax';
}
