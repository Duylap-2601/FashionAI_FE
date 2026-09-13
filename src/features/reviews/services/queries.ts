import type { Review, ReviewReply, ReviewsMeta } from '@/features/reviews/types/reviews';
import { http, type HttpOptions } from '@/lib/http';

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
  const data = await http.get<Review[] | { data?: Review[]; meta?: ReviewsMeta }>(`/products/${productId}/reviews`, { params });
  return {
    data: (Array.isArray(data) ? data : data.data) || [],
    meta: (!Array.isArray(data) && data.meta) || {
      total: 0,
      page,
      limit,
      totalPages: 1,
      avgRating: 0,
      reviewCount: 0,
      distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    },
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
  const data = await http.get<{ data?: Partial<ReviewsMeta>; avgRating?: number; reviewCount?: number; distribution?: ReviewsMeta['distribution'] }>(`/products/${productId}/reviews/stats`);
  const stats = data.data || data || {};
  return {
    avgRating: Number(stats.avgRating || 0),
    reviewCount: Number(stats.reviewCount || 0),
    distribution: stats.distribution || { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
  };
}

export async function fetchMyReviews(page: number, limit: number) {
  const data = await http.get<Review[] | { data?: Review[]; meta?: ReviewsMeta }>('/products/reviews/my', { params: { page, limit } });
  return {
    data: (Array.isArray(data) ? data : data.data) || [],
    meta: (!Array.isArray(data) && data.meta) || { total: 0, page, limit, totalPages: 1 },
  };
}

export async function fetchReviewReplies(reviewId: string | undefined) {
  if (!reviewId) return [];
  const data = await http.get<ReviewReply[] | { data?: ReviewReply[] }>(`/products/reviews/${reviewId}/replies`);
  return (Array.isArray(data) ? data : data.data) || [];
}

export function fetchAdminReviewsResponse() {
  return http.get('/products/admin/reviews');
}

export function fetchProductReviewsResponse(id: string, config: HttpOptions) {
  return http.get(`/products/${id}/reviews`, config);
}

export { queryKeys } from './query-keys';
