import { api } from '@/lib/api';

export async function fetchUserProfile() {
  const res = await api.get('/users/me');
  return res.data || {};
}

export { queryKeys } from './query-keys';
