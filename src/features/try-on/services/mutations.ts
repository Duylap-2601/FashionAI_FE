import type { TryOnRequest, TryOnResult } from '@/features/try-on/types/try-on';
import { api } from '@/lib/api';

export async function submitTryOn(payload: TryOnRequest) {
  const formData = new FormData();
  formData.append('humanImage', payload.humanImage);

  if (payload.garments && payload.garments.length > 0) {
    payload.garments.forEach((g, idx) => {
      formData.append(`garments[${idx}][category]`, g.garmentCategory);
      if (g.productId) {
        formData.append(`garments[${idx}][productId]`, g.productId);
      } else if (g.garmentImage) {
        formData.append(`garments[${idx}][image]`, g.garmentImage);
      }
    });
    // Also provide primary fields for backward compatibility
    if (payload.garments[0]?.productId) formData.append('productId', payload.garments[0].productId);
    if (payload.garments[0]?.garmentCategory) formData.append('garmentCategory', payload.garments[0].garmentCategory);
    if (payload.garments[0]?.garmentImage) formData.append('garmentImage', payload.garments[0].garmentImage);
  } else {
    if (payload.garmentImage) formData.append('garmentImage', payload.garmentImage);
    if (payload.productId) formData.append('productId', payload.productId);
    if (payload.garmentCategory) formData.append('garmentCategory', payload.garmentCategory);
  }

  const res = await api.post('/try-on', formData, {
    timeout: 180000,
  });
  return res.data as TryOnResult;
}

export async function deleteTryOnHistory(id: string) {
  await api.delete(`/try-on/history/${id}`);
  return id;
}

export async function deleteManyTryOnHistory(ids: string[]) {
  // Execute deletions sequentially or via Promise.all if supported
  await Promise.all(ids.map(id => api.delete(`/try-on/history/${id}`)));
  return ids;
}

export { mutationKeys } from './mutation-keys';
