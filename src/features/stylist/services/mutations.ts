import { buildFormData, normalizeStylistResult } from '@/features/stylist/services/stylist-utils';
import type { StylistAnalysisRequest, StylistResult } from '@/features/stylist/types/stylist';
import { api } from '@/lib/api';

export async function analyzeStylist(payload: StylistAnalysisRequest) {
  const formData = buildFormData(payload);

  const res = await api.post('/stylist/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 90000,
  });
  return normalizeStylistResult(res.data as StylistResult);
}

export async function deleteStylistHistory(id: string) {
  await api.delete(`/stylist/history/${id}`);
  return id;
}

export { mutationKeys } from './mutation-keys';
