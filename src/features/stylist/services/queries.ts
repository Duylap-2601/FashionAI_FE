import { normalizeStylistResult } from '@/features/stylist/services/stylist-utils';
import type { StylistHistoryMeta, StylistResult } from '@/features/stylist/types/stylist';
import { api } from '@/lib/api';

export async function fetchStylistHistory(page: number, pageSize: number) {
  const res = await api.get('/stylist/history', {
    params: { page, limit: pageSize },
  });
  const items = ((res.data || []) as StylistResult[]).map(normalizeStylistResult);
  const meta = (res.data as { __meta?: StylistHistoryMeta })?.__meta ?? {
    total: items.length,
    page,
    limit: pageSize,
    totalPages: 1,
  };
  return { items, meta };
}

export { queryKeys } from './query-keys';
