import { buildFormData, normalizeStylistResult } from '@/features/stylist/services/stylist-utils';
import type { StylistAnalysisRequest, StylistResult } from '@/features/stylist/types/stylist';
import { http } from '@/lib/http';

export async function analyzeStylist(payload: StylistAnalysisRequest) {
  const formData = buildFormData(payload);

  const data = await http.post<StylistResult, FormData>('/stylist/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 90000,
  });
  return normalizeStylistResult(data);
}

export async function deleteStylistHistory(id: string) {
  await http.delete(`/stylist/history/${id}`);
  return id;
}

export { mutationKeys } from './mutation-keys';
