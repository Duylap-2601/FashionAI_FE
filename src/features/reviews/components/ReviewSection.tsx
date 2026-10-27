'use client';

import { useAuthStore } from '@/features/auth/store/authStore';
import { AccountConfirmDialog } from '@/features/profile/components/account-ui';
import { RatingOverview } from '@/features/reviews/components/RatingOverview';
import { ReviewCard } from '@/features/reviews/components/ReviewCard';
import { WriteReviewModal } from '@/features/reviews/components/WriteReviewModal';
import { useAdminDeleteReview, useCanReview, useDeleteReview, useReviews, useReviewStats } from '@/features/reviews/hooks/useReviews';
import type { Review } from '@/features/reviews/types/reviews';
import type { ReviewSectionProps } from '@/features/reviews/types/review-section';
import { cn } from '@/lib/utils';
import { Loader2, MessageSquarePlus, Star } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';

export function ReviewSection({
  productId,
  productName,
  productImage,
}: ReviewSectionProps) {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id;
  const isAdmin = user?.role === 'ADMIN';

  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const [accumulatedReviews, setAccumulatedReviews] = useState<Review[]>([]);

  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const [deletingReview, setDeletingReview] = useState<Review | null>(null);
  const [adminDeletingReview, setAdminDeletingReview] = useState<Review | null>(null);

  const { stats, isLoading: isStatsLoading } = useReviewStats(productId);
  const { reviews, meta, isLoading: isReviewsLoading } = useReviews(productId, {
    page,
    limit: 8,
    rating: selectedRating,
  });

  const { canReview, eligibleOrderId, reason } = useCanReview(productId);
  const deleteMutation = useDeleteReview();
  const adminDeleteMutation = useAdminDeleteReview();

  const handleSelectRating = (rating?: number) => {
    setSelectedRating(rating);
    setPage(1);
    setAccumulatedReviews([]);
  };

  React.useEffect(() => {
    if (page === 1) {
      setAccumulatedReviews(reviews);
    } else if (reviews.length > 0) {
      setAccumulatedReviews((prev) => {
        const existingIds = new Set(prev.map((r) => r.id));
        const newOnes = reviews.filter((r) => !existingIds.has(r.id));
        return [...prev, ...newOnes];
      });
    }
  }, [reviews, page]);

  const handleOpenWriteReview = () => {
    if (status !== 'authenticated') {
      toast.error('Vui lòng đăng nhập để đánh giá sản phẩm');
      return;
    }

    if (!canReview) {
      if (reason === 'already_reviewed') {
        toast.error('Bạn đã đánh giá sản phẩm này');
      } else if (reason === 'not_purchased_or_delivered') {
        toast.error('Chỉ user đã mua và nhận hàng mới được đánh giá');
      } else {
        toast.error('Chỉ user đã mua và nhận hàng mới được đánh giá');
      }
      return;
    }

    setEditingReview(null);
    setIsWriteModalOpen(true);
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setIsWriteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingReview) return;
    try {
      await deleteMutation.mutateAsync({ id: deletingReview.id, productId });
      toast.success('Đã xóa đánh giá của bạn');
      setDeletingReview(null);
    } catch {
      toast.error('Không thể xóa đánh giá. Vui lòng thử lại.');
    }
  };

  const confirmAdminDelete = async () => {
    if (!adminDeletingReview) return;
    try {
      await adminDeleteMutation.mutateAsync({ id: adminDeletingReview.id, productId });
      toast.success('Admin: Đã xóa đánh giá vi phạm');
      setAdminDeletingReview(null);
    } catch {
      toast.error('Không thể xóa đánh giá. Vui lòng kiểm tra quyền admin.');
    }
  };

  const totalReviews = meta?.total ?? stats?.reviewCount ?? 0;
  const hasMore = meta ? meta.page < meta.totalPages : false;

  return (
    <section id="product-reviews" className="border-t border-landing-line bg-landing-ivory py-16 md:py-24">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 md:px-8">
        <div className="flex flex-col gap-5 border-b border-landing-line pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-landing-brass-ink">
              Đánh giá
            </p>
            <h2 className="mt-2 font-display text-landing-h2 text-landing-obsidian">
              Đánh giá và nhận xét
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-landing-muted">
              Phản hồi thực tế từ khách hàng đã trải nghiệm sản phẩm và may đo.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenWriteReview}
            className={cn(
              'inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-[2px] bg-landing-oxblood px-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-landing-paper transition-colors hover:bg-landing-obsidian sm:self-auto',
              focusRing,
            )}
          >
            <MessageSquarePlus className="h-4 w-4" strokeWidth={1.75} />
            Viết đánh giá
          </button>
        </div>

        <RatingOverview
          stats={stats}
          selectedRating={selectedRating}
          onSelectRating={handleSelectRating}
          isLoading={isStatsLoading}
        />

        <div className="mt-2 flex flex-col gap-4">
          {isReviewsLoading && accumulatedReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-landing-muted">
              <Loader2 className="h-7 w-7 animate-spin text-landing-oxblood" strokeWidth={1.75} />
              <span className="text-sm">Đang tải các đánh giá...</span>
            </div>
          ) : accumulatedReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 border border-landing-line bg-landing-ivory px-6 py-14 text-center">
              <Star className="h-7 w-7 text-landing-oxblood" strokeWidth={1.5} aria-hidden="true" />
              <h4 className="font-display text-xl text-landing-obsidian">
                {selectedRating
                  ? `Chưa có đánh giá ${selectedRating} sao nào`
                  : 'Chưa có đánh giá nào cho sản phẩm này'}
              </h4>
              <p className="max-w-md text-sm leading-relaxed text-landing-muted">
                {selectedRating
                  ? 'Hãy thử chọn mức sao khác hoặc xem tất cả đánh giá.'
                  : 'Nếu bạn đã mua và nhận sản phẩm này, hãy là người đầu tiên chia sẻ cảm nhận.'}
              </p>
              <button
                type="button"
                onClick={handleOpenWriteReview}
                className={cn(
                  'mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-[2px] border border-landing-line px-4 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-landing-obsidian transition-colors hover:border-landing-oxblood hover:text-landing-oxblood',
                  focusRing,
                )}
              >
                <MessageSquarePlus className="h-3.5 w-3.5" strokeWidth={1.75} />
                Viết đánh giá
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {accumulatedReviews.map((item) => (
                <ReviewCard
                  key={item.id}
                  review={item}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  onEdit={handleEditReview}
                  onDelete={(rev) => setDeletingReview(rev)}
                  onAdminDelete={(rev) => setAdminDeletingReview(rev)}
                />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={isReviewsLoading}
                className={cn(
                  'inline-flex h-11 items-center justify-center gap-2 rounded-[2px] border border-landing-line bg-landing-paper px-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-landing-obsidian transition-colors hover:border-landing-oxblood hover:text-landing-oxblood disabled:opacity-50',
                  focusRing,
                )}
              >
                {isReviewsLoading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />}
                Xem thêm đánh giá ({totalReviews - accumulatedReviews.length})
              </button>
            </div>
          )}
        </div>
      </div>

      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => {
          setIsWriteModalOpen(false);
          setEditingReview(null);
        }}
        productId={productId}
        productName={productName}
        productImage={productImage}
        orderId={eligibleOrderId || undefined}
        editingReview={editingReview}
      />

      <AccountConfirmDialog
        open={Boolean(deletingReview)}
        onOpenChange={(open) => { if (!open) setDeletingReview(null); }}
        title="Xóa đánh giá"
        description="Bạn có chắc chắn muốn xóa đánh giá này? Sau khi xóa, bạn có thể đánh giá lại sản phẩm này."
        confirmLabel="Xóa đánh giá"
        isPending={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />

      <AccountConfirmDialog
        open={Boolean(adminDeletingReview)}
        onOpenChange={(open) => { if (!open) setAdminDeletingReview(null); }}
        title="Xóa đánh giá (quyền Admin)"
        description={
          adminDeletingReview
            ? `Đánh giá của ${adminDeletingReview.user?.name || 'khách hàng này'} sẽ bị gỡ vĩnh viễn khỏi hệ thống. Điểm trung bình và số lượng đánh giá của sản phẩm sẽ được cập nhật lại.`
            : ''
        }
        confirmLabel="Xóa vi phạm"
        isPending={adminDeleteMutation.isPending}
        onConfirm={confirmAdminDelete}
      />
    </section>
  );
}
