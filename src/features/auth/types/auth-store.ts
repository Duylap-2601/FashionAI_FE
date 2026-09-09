export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type BackendUserRole = 'USER' | 'ADMIN';

export type BackendUserTier = 'FREE' | 'MEMBER' | 'VIP';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  avatarUrl?: string | null;
  role: BackendUserRole;
  tier: BackendUserTier;
  tierExpiresAt?: string | null;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  accessTokenExpiresAt?: string | null;
}

export interface RawAuthUser {
  id?: unknown;
  _id?: unknown;
  name?: unknown;
  fullName?: unknown;
  email?: unknown;
  image?: unknown;
  avatarUrl?: unknown;
  role?: unknown;
  tier?: unknown;
  tierExpiresAt?: unknown;
  accessTokenExpiresAt?: unknown;
}

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  accessToken: string | null;
  accessTokenExpiresAt: string | null;
  setLoading: () => void;
  setSession: (session: AuthSession) => void;
  setAccessToken: (accessToken: string, accessTokenExpiresAt?: string | null) => void;
  clearSession: () => void;
}
