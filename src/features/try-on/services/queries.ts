import type { TryOnResult } from '@/features/try-on/types/try-on';
import { http } from '@/lib/http';

export async function fetchTryOnHistory(page: number, limit: number) {
  // page & limit are required per Swagger spec
  const data = await http.get<TryOnResult[]>('/try-on/history', { params: { page, limit } });
  return data || [];
}

export function fetchTryOnImage(url: string) {
  return fetch(url);
}

export { queryKeys } from './query-keys';
