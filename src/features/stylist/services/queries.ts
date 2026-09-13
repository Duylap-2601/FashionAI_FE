import { normalizeStylistResult } from '@/features/stylist/services/stylist-utils';
import type { StylistHistoryMeta, StylistResult } from '@/features/stylist/types/stylist';
import { http } from '@/lib/http';

export async function fetchStylistHistory(page: number, pageSize: number) {
  const data = await http.get<(StylistResult[] & { __meta?: StylistHistoryMeta }) | { items?: StylistResult[]; meta?: StylistHistoryMeta }>('/stylist/history', {
    params: { page, limit: pageSize },
  });
  const rawItems = Array.isArray(data) ? data : data.items || [];
  const items = rawItems.map(normalizeStylistResult);
  const meta = (Array.isArray(data) ? data.__meta : data.meta) ?? {
    total: items.length,
    page,
    limit: pageSize,
    totalPages: 1,
  };
  return { items, meta };
}

export { queryKeys } from './query-keys';
