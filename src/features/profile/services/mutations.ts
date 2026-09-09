import type { UserProfile } from '@/features/profile/types/profile';
import { api } from '@/lib/api';

export async function updateUserProfile(profile: Partial<UserProfile>) {
  const res = await api.put('/users/me', profile);
  return res.data;
}

export { mutationKeys } from './mutation-keys';
