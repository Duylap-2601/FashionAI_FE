'use client';

import { queryKeys as productsQueryKeys } from '@/features/products/services/query-keys';
import { mutationKeys } from '@/features/reviews/services/mutation-keys';
import { queryKeys as reviewsQueryKeys } from '@/features/reviews/services/query-keys';
import { adminDeleteReview, createReply, createReview, deleteReply, deleteReview, updateReply, updateReview } from '@/features/reviews/services/mutations';
import { fetchMyReviews, fetchReviewReplies, fetchReviews, fetchReviewStats } from '@/features/reviews/services/queries';
import type { Review, ReviewReply, ReviewsResponse, ReviewStats } from '@/features/reviews/types/reviews';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ─── Lấy danh sách reviews của 1 sản phẩm (phân trang + lọc theo số sao) ────
export function useReviews(productId?: string, options?: { page?: number; limit?: number; rating?: number }) {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 10;
  const rating = options?.rating;

  const query = useQuery<ReviewsResponse>({
    queryKey: reviewsQueryKeys.reviews(productId, page, limit, rating),
    queryFn: () => fetchReviews(productId, page, limit, rating),
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
    queryKey: reviewsQueryKeys.reviewStats(productId),
    queryFn: () => fetchReviewStats(productId),
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
    mutationKey: mutationKeys.createReview(),
    mutationFn: createReview,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.reviews(variables.productId) });
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.reviewStats(variables.productId) });
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.product(variables.productId) });
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.products() });
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.myReviews() });
    },
  });
}

// ─── Cập nhật review (chỉ comment & images) ──────────────────────────────────
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.updateReview(),
    mutationFn: updateReview,
    onSuccess: (_, variables) => {
      if (variables.productId) {
        queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.reviews(variables.productId) });
      } else {
        queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.reviews() });
      }
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.myReviews() });
    },
  });
}

// ─── Người dùng xóa review của mình ─────────────────────────────────────────
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.deleteReview(),
    mutationFn: deleteReview,
    onSuccess: (_, variables) => {
      if (variables.productId) {
        queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.reviews(variables.productId) });
        queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.reviewStats(variables.productId) });
        queryClient.invalidateQueries({ queryKey: productsQueryKeys.product(variables.productId) });
      } else {
        queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.reviews() });
      }
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.products() });
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.myReviews() });
    },
  });
}

// ─── Admin xóa review bất kỳ ────────────────────────────────────────────────
export function useAdminDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.adminDeleteReview(),
    mutationFn: adminDeleteReview,
    onSuccess: (_, variables) => {
      if (variables.productId) {
        queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.reviews(variables.productId) });
        queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.reviewStats(variables.productId) });
        queryClient.invalidateQueries({ queryKey: productsQueryKeys.product(variables.productId) });
      } else {
        queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.reviews() });
      }
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.products() });
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.adminReviews() });
    },
  });
}

// ─── Danh sách review của user hiện tại ─────────────────────────────────────
export function useMyReviews(options?: { page?: number; limit?: number }) {
  const status = useAuthStore((state) => state.status);
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 10;

  const query = useQuery<{ data: Review[]; meta: { total: number; page: number; limit: number; totalPages: number } }>({
    queryKey: reviewsQueryKeys.myReviews(page, limit),
    queryFn: () => fetchMyReviews(page, limit),
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
  const status = useAuthStore((state) => state.status);
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
    queryKey: reviewsQueryKeys.replies(reviewId),
    queryFn: () => fetchReviewReplies(reviewId),
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
    mutationKey: mutationKeys.createReply(),
    mutationFn: createReply,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.replies(variables.reviewId) });
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.reviews() });
    },
  });
}

// ─── Cập nhật reply ─────────────────────────────────────────────────────────
export function useUpdateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.updateReply(),
    mutationFn: updateReply,
    onSuccess: (_, variables) => {
      if (variables.reviewId) {
        queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.replies(variables.reviewId) });
      } else {
        queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.replies() });
      }
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.reviews() });
    },
  });
}

// ─── Xóa reply ─────────────────────────────────────────────────────────────
export function useDeleteReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.deleteReply(),
    mutationFn: deleteReply,
    onSuccess: (_, variables) => {
      if (variables.reviewId) {
        queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.replies(variables.reviewId) });
      } else {
        queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.replies() });
      }
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.reviews() });
    },
  });
}
