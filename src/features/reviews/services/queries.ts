import type { Review, ReviewReply, ReviewsMeta } from '@/features/reviews/types/reviews';
import { api } from '@/lib/api';
import type { AxiosRequestConfig } from 'axios';

export async function fetchReviews(productId: string | undefined, page: number, limit: number, rating: number | undefined) {
  if (!productId) {
    return {
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        avgRating: 0,
        reviewCount: 0,
        distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
      },
    };
  }
  const params: Record<string, string | number> = { page, limit };
  if (rating && rating >= 1 && rating <= 5) {
    params.rating = rating;
  }
  const res = await api.get(`/products/${productId}/reviews`, { params });
  return {
    data: (res.data?.data || res.data || []) as Review[],
    meta: (res.data?.meta || {
      total: 0,
      page,
      limit,
      totalPages: 1,
      avgRating: 0,
      reviewCount: 0,
      distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    }) as ReviewsMeta,
  };
}

export async function fetchReviewStats(productId: string | undefined) {
  if (!productId) {
    return {
      avgRating: 0,
      reviewCount: 0,
      distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    };
  }
  const res = await api.get(`/products/${productId}/reviews/stats`);
  const data = res.data?.data || res.data || {};
  return {
    avgRating: Number(data.avgRating || 0),
    reviewCount: Number(data.reviewCount || 0),
    distribution: data.distribution || { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
  };
}

export async function fetchMyReviews(page: number, limit: number) {
  const res = await api.get('/products/reviews/my', { params: { page, limit } });
  return {
    data: (res.data?.data || res.data || []) as Review[],
    meta: (res.data?.meta || { total: 0, page, limit, totalPages: 1 }),
  };
}

export async function fetchReviewReplies(reviewId: string | undefined) {
  if (!reviewId) return [];
  const res = await api.get(`/products/reviews/${reviewId}/replies`);
  return (res.data?.data || res.data || []) as ReviewReply[];
}

export function fetchAdminReviewsResponse() {
  return api.get('/products/admin/reviews');
}

export function fetchProductReviewsResponse(id: string, config: AxiosRequestConfig) {
  return api.get(`/products/${id}/reviews`, config);
}

export { queryKeys } from './query-keys';
