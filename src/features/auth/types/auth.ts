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
