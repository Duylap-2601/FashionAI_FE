'use client';

import { ADMIN_REVIEW_SCAN_LIMIT } from '@/features/admin/constants/admin-dashboard-page';
import { useLatestRef } from '@/features/admin/hooks/use-latest-ref';
import { fetchAdminStats } from '@/features/admin/services/queries';
import type { AdminProduct, AdminStats } from '@/features/admin/types/admin-dashboard-page';
import { fetchAdminReviewsResponse, fetchProductReviewsResponse, toReviewList } from '@/features/reviews/services/queries';
import type { Review } from '@/features/reviews/types/reviews';
import { useCallback, useState } from 'react';

function summarizeRatings(reviews: Pick<Review, 'rating'>[]) {
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  return { count: reviews.length, avg: Math.round((sum / reviews.length) * 10) / 10 };
}

/** Thống kê /admin/stats và tổng hợp đánh giá cho tab tổng quan. */
export function useAdminOverviewData({ products }: { products: AdminProduct[] }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const productsRef = useLatestRef(products);

  const fetchStats = useCallback(async () => {
    try {
      setStats(await fetchAdminStats() as AdminStats);
    } catch (e) {
      console.warn('Backend API stats fetch failed.', e);
    }
  }, []);

  /** Ưu tiên endpoint admin; nếu lỗi hoặc rỗng thì quét đánh giá từng sản phẩm đang có. */
  const fetchReviewStats = useCallback(async (prods?: AdminProduct[]) => {
    try {
      const list = toReviewList(await fetchAdminReviewsResponse());
      if (list.length > 0) {
        const { count, avg } = summarizeRatings(list);
        setReviewsCount(count);
        setAvgRating(avg);
        return;
      }
    } catch {
      // Endpoint admin lỗi hoặc chưa hỗ trợ, chuyển sang fallback
    }

    const targetProducts = prods && prods.length > 0 ? prods : productsRef.current;
    if (targetProducts.length > 0) {
      try {
        const results = await Promise.allSettled(targetProducts.map(async (p) =>
          toReviewList(await fetchProductReviewsResponse(p.id, { params: { limit: ADMIN_REVIEW_SCAN_LIMIT } }))
        ));
        const aggregated = results.flatMap(item => item.status === 'fulfilled' ? item.value : []);
        if (aggregated.length > 0) {
          const { count, avg } = summarizeRatings(aggregated);
          setReviewsCount(count);
          setAvgRating(avg);
          return;
        }
      } catch (err) {
        console.warn('Fallback reviews scan failed:', err);
      }
    }

    setReviewsCount(0);
    setAvgRating(0);
  }, [productsRef]);

  return {
    stats,
    reviewsCount,
    avgRating,
    fetchStats,
    fetchReviewStats,
  };
}
