import type { CreateReplyInput, CreateReviewInput, DeleteReplyInput, UpdateReplyInput, UpdateReviewInput } from '@/features/reviews/types/reviews';
import { api } from '@/lib/api';

export async function createReview(payload: CreateReviewInput) {
  const { productId, ...body } = payload;
  const res = await api.post(`/products/${productId}/reviews`, body);
  return res.data?.data || res.data;
}

export async function updateReview({ id, ...body }: UpdateReviewInput) {
  const res = await api.patch(`/products/reviews/${id}`, body);
  return res.data?.data || res.data;
}

export async function deleteReview({ id }: { id: string; productId?: string }) {
  const res = await api.delete(`/products/reviews/${id}`);
  return res.data;
}

export async function adminDeleteReview({ id }: { id: string; productId?: string }) {
  const res = await api.delete(`/products/admin/reviews/${id}`);
  return res.data;
}

export async function createReply({ reviewId, comment }: CreateReplyInput) {
  const res = await api.post(`/products/reviews/${reviewId}/replies`, { comment });
  return res.data?.data || res.data;
}

export async function updateReply({ id, comment }: UpdateReplyInput) {
  const res = await api.patch(`/products/reviews/replies/${id}`, { comment });
  return res.data?.data || res.data;
}

export async function deleteReply({ id }: DeleteReplyInput) {
  const res = await api.delete(`/products/reviews/replies/${id}`);
  return res.data;
}

export { mutationKeys } from './mutation-keys';
