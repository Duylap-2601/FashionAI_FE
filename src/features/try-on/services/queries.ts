import type { TryOnResult } from '@/features/try-on/types/try-on';
import { api } from '@/lib/api';

export async function fetchTryOnHistory(page: number, limit: number) {
  // page & limit are required per Swagger spec
  const res = await api.get('/try-on/history', { params: { page, limit } });
  return (res.data || []) as TryOnResult[];
}

export function fetchTryOnImage(url: string) {
  return fetch(url);
}

export { queryKeys } from './query-keys';
