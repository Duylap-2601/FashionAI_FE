'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { useOrders } from './useOrders';

export interface ReviewUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface ReviewProduct {
  id: string;
  name: string;
  garmentUrl?: string | null;
  image?: string | null;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number; // 1-5
  comment?: string | null;
  images?: string[] | null;
  createdAt: string;
  updatedAt: string;
  user?: ReviewUser;
  product?: ReviewProduct;
  replies?: ReviewReply[];
}

export interface ReviewReplyUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
  role?: 'ADMIN' | 'USER' | string;
}

export interface ReviewReply {
  id: string;
  reviewId: string;
  userId: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user?: ReviewReplyUser;
}

export interface CreateReplyInput {
  reviewId: string;
  comment: string;
  productId?: string;
}

export interface UpdateReplyInput {
  id: string;
  comment: string;
  reviewId?: string;
  productId?: string;
}

export interface DeleteReplyInput {
  id: string;
  reviewId?: string;
  productId?: string;
}

export interface ReviewDistribution {
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
}

export interface ReviewStats {
  avgRating: number;
  reviewCount: number;
  distribution: ReviewDistribution;
}

export interface ReviewsMeta extends ReviewStats {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReviewsResponse {
  data: Review[];
  meta: ReviewsMeta;
}

export interface CreateReviewInput {
  productId: string;
  orderId?: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export interface UpdateReviewInput {
  id: string;
  productId?: string;
  comment?: string;
  images?: string[];
}

// ─── Lấy danh sách reviews của 1 sản phẩm (phân trang + lọc theo số sao) ────
export function useReviews(productId?: string, options?: { page?: number; limit?: number; rating?: number }) {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 10;
  const rating = options?.rating;

  const query = useQuery<ReviewsResponse>({
    queryKey: ['reviews', productId, page, limit, rating],
    queryFn: async () => {
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
    },
    enabled: !!productId,
  });

  return {
    reviews: query.data?.data || [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

// ─── Lấy thống kê rating (avgRating, reviewCount, distribution) ──────────────
export function useReviewStats(productId?: string) {
  const query = useQuery<ReviewStats>({
    queryKey: ['review-stats', productId],
    queryFn: async () => {
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
    },
    enabled: !!productId,
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

// ─── Tạo review mới ─────────────────────────────────────────────────────────
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateReviewInput) => {
      const { productId, ...body } = payload;
      const res = await api.post(`/products/${productId}/reviews`, body);
      return res.data?.data || res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['review-stats', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
    },
  });
}

// ─── Cập nhật review (chỉ comment & images) ──────────────────────────────────
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...body }: UpdateReviewInput) => {
      const res = await api.patch(`/products/reviews/${id}`, body);
      return res.data?.data || res.data;
    },
    onSuccess: (_, variables) => {
      if (variables.productId) {
        queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
      }
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
    },
  });
}

// ─── Người dùng xóa review của mình ─────────────────────────────────────────
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; productId?: string }) => {
      const res = await api.delete(`/products/reviews/${id}`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      if (variables.productId) {
        queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
        queryClient.invalidateQueries({ queryKey: ['review-stats', variables.productId] });
        queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
    },
  });
}

// ─── Admin xóa review bất kỳ ────────────────────────────────────────────────
export function useAdminDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; productId?: string }) => {
      const res = await api.delete(`/products/admin/reviews/${id}`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      if (variables.productId) {
        queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
        queryClient.invalidateQueries({ queryKey: ['review-stats', variables.productId] });
        queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });
}

// ─── Danh sách review của user hiện tại ─────────────────────────────────────
export function useMyReviews(options?: { page?: number; limit?: number }) {
  const { status } = useSession();
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 10;

  const query = useQuery<{ data: Review[]; meta: { total: number; page: number; limit: number; totalPages: number } }>({
    queryKey: ['my-reviews', page, limit],
    queryFn: async () => {
      const res = await api.get('/products/reviews/my', { params: { page, limit } });
      return {
        data: (res.data?.data || res.data || []) as Review[],
        meta: (res.data?.meta || { total: 0, page, limit, totalPages: 1 }),
      };
    },
    enabled: status === 'authenticated',
  });

  return {
    reviews: query.data?.data || [],
    meta: query.data?.meta,
    isLoading: status === 'loading' || query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

// ─── Helper kiểm tra user đã mua và nhận hàng sản phẩm này chưa ─────────────
export function useCanReview(productId?: string) {
  const { status } = useSession();
  const { orders, isLoading: ordersLoading } = useOrders();
  const { reviews: myReviews, isLoading: reviewsLoading } = useMyReviews({ limit: 100 });

  if (status !== 'authenticated' || !productId) {
    return {
      canReview: false,
      eligibleOrderId: null,
      eligibleOrders: [],
      reason: status !== 'authenticated' ? 'not_authenticated' : 'no_product',
      isLoading: false,
    };
  }

  if (ordersLoading || reviewsLoading) {
    return {
      canReview: false,
      eligibleOrderId: null,
      eligibleOrders: [],
      reason: 'loading',
      isLoading: true,
    };
  }

  // Tìm các đơn hàng DELIVERED có chứa productId này
  const deliveredOrders = orders.filter((o) => {
    if (o.status !== 'DELIVERED') return false;
    return o.items.some((item) => item.productId === productId);
  });

  if (deliveredOrders.length === 0) {
    return {
      canReview: false,
      eligibleOrderId: null,
      eligibleOrders: [],
      reason: 'not_purchased_or_delivered',
      isLoading: false,
    };
  }

  // Tìm đơn hàng DELIVERED chưa được review cho sản phẩm này
  const reviewedOrderIds = new Set(
    myReviews
      .filter((r) => r.productId === productId)
      .map((r) => r.orderId)
  );

  const availableOrders = deliveredOrders.filter((o) => !reviewedOrderIds.has(o.id));

  if (availableOrders.length === 0) {
    return {
      canReview: false,
      eligibleOrderId: null,
      eligibleOrders: [],
      reason: 'already_reviewed',
      isLoading: false,
    };
  }

  return {
    canReview: true,
    eligibleOrderId: availableOrders[0]?.id || null,
    eligibleOrders: availableOrders,
    reason: 'eligible',
    isLoading: false,
  };
}

// ─── Lấy danh sách replies của 1 review ─────────────────────────────────────
export function useReviewReplies(reviewId?: string) {
  const query = useQuery<ReviewReply[]>({
    queryKey: ['replies', reviewId],
    queryFn: async () => {
      if (!reviewId) return [];
      const res = await api.get(`/products/reviews/${reviewId}/replies`);
      return (res.data?.data || res.data || []) as ReviewReply[];
    },
    enabled: !!reviewId,
  });

  return {
    replies: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

// ─── Tạo reply mới cho review ───────────────────────────────────────────────
export function useCreateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, comment }: CreateReplyInput) => {
      const res = await api.post(`/products/reviews/${reviewId}/replies`, { comment });
      return res.data?.data || res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['replies', variables.reviewId] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

// ─── Cập nhật reply ─────────────────────────────────────────────────────────
export function useUpdateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, comment }: UpdateReplyInput) => {
      const res = await api.patch(`/products/reviews/replies/${id}`, { comment });
      return res.data?.data || res.data;
    },
    onSuccess: (_, variables) => {
      if (variables.reviewId) {
        queryClient.invalidateQueries({ queryKey: ['replies', variables.reviewId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['replies'] });
      }
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

// ─── Xóa reply ─────────────────────────────────────────────────────────────
export function useDeleteReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteReplyInput) => {
      const res = await api.delete(`/products/reviews/replies/${id}`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      if (variables.reviewId) {
        queryClient.invalidateQueries({ queryKey: ['replies', variables.reviewId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['replies'] });
      }
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
