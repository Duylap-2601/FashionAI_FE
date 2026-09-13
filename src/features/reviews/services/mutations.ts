import type { CreateReplyInput, CreateReviewInput, DeleteReplyInput, UpdateReplyInput, UpdateReviewInput } from '@/features/reviews/types/reviews';
import { http } from '@/lib/http';

export async function createReview(payload: CreateReviewInput) {
  const { productId, ...body } = payload;
  const data = await http.post<{ data?: unknown } | unknown>(`/products/${productId}/reviews`, body);
  return data && typeof data === 'object' && 'data' in data ? data.data : data;
}

export async function updateReview({ id, ...body }: UpdateReviewInput) {
  const data = await http.patch<{ data?: unknown } | unknown>(`/products/reviews/${id}`, body);
  return data && typeof data === 'object' && 'data' in data ? data.data : data;
}

export async function deleteReview({ id }: { id: string; productId?: string }) {
  return http.delete(`/products/reviews/${id}`);
}

export async function adminDeleteReview({ id }: { id: string; productId?: string }) {
  return http.delete(`/products/admin/reviews/${id}`);
}

export async function createReply({ reviewId, comment }: CreateReplyInput) {
  const data = await http.post<{ data?: unknown } | unknown>(`/products/reviews/${reviewId}/replies`, { comment });
  return data && typeof data === 'object' && 'data' in data ? data.data : data;
}

export async function updateReply({ id, comment }: UpdateReplyInput) {
  const data = await http.patch<{ data?: unknown } | unknown>(`/products/reviews/replies/${id}`, { comment });
  return data && typeof data === 'object' && 'data' in data ? data.data : data;
}

export async function deleteReply({ id }: DeleteReplyInput) {
  return http.delete(`/products/reviews/replies/${id}`);
}

export { mutationKeys } from './mutation-keys';
