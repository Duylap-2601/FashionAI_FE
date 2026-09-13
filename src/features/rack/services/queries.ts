import type { RackItem } from '@/features/rack/types/rack';
import { http } from '@/lib/http';

export async function fetchRackItems(): Promise<RackItem[]> {
  const data = await http.get<RackItem[] | { items?: RackItem[] }>('/rack');
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

export { queryKeys } from './query-keys';
