import type { UserProfile } from '@/features/profile/types/profile';
import { http } from '@/lib/http';

export async function fetchUserProfile(): Promise<UserProfile> {
  return (await http.get<UserProfile>('/users/me')) || { name: '', email: '' };
}

export { queryKeys } from './query-keys';
