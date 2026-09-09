import { api } from '@/lib/api';

export async function fetchRackItems() {
  const res = await api.get('/rack');
  const data = res.data;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

export { queryKeys } from './query-keys';
