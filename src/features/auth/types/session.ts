import type { RawAuthUser } from '@/features/auth/types/auth-store';

export interface AuthPayload {
  user?: RawAuthUser;
  accessToken?: string;
  accessTokenExpiresAt?: string | null;
  refreshToken?: string;
  refreshTokenExpiresAt?: string | null;
}

export interface ApiEnvelope<T> {
  data?: T;
}
