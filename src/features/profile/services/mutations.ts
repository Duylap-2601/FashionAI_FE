import type { UpdateUserProfileRequest, UserProfile } from '@/features/profile/types/profile';
import { api } from '@/lib/api';

export async function updateUserProfile(profile: UpdateUserProfileRequest) {
  const res = await api.put<UserProfile>('/users/me', profile);
  return res.data;
}

export { mutationKeys } from './mutation-keys';
