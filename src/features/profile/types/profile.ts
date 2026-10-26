/** Hồ sơ từ GET /users/me. PUT /users/me chỉ nhận `name` và `avatarUrl`. */
export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  tier?: 'FREE' | 'MEMBER' | 'VIP';
  tierExpiresAt?: string | null;
  isVerified?: boolean;
  createdAt?: string;
}

export type UpdateUserProfileRequest = Partial<Pick<UserProfile, 'name' | 'avatarUrl'>>;
