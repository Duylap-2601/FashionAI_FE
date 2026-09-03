'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { MessageSquarePlus, Star, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import {
  useReviews,
  useReviewStats,
  useCanReview,
  useDeleteReview,
  useAdminDeleteReview,
  Review,
} from '@/hooks/useReviews';
import { RatingOverview } from './RatingOverview';
import { ReviewCard } from './ReviewCard';
import { WriteReviewModal } from './WriteReviewModal';

interface ReviewSectionProps {
  productId: string;
  productName: string;
  productImage?: string;
}

export function ReviewSection({
  productId,
  productName,
  productImage,
}: ReviewSectionProps) {
  const { data: session, status } = useSession();
  const currentUserId = (session?.user as { id?: string })?.id;
  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';

  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const [accumulatedReviews, setAccumulatedReviews] = useState<Review[]>([]);

  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Modal xác nhận xóa
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

  // Reset filter rating
  const handleSelectRating = (rating?: number) => {
    setSelectedRating(rating);
    setPage(1);
    setAccumulatedReviews([]);
  };

  // Cập nhật reviews tích lũy khi đổi trang hoặc load dữ liệu
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
    <section id="product-reviews" className="py-12 border-t border-neutral-200">
      <div className="max-w-[1280px] w-full mx-auto px-4 md:px-8 flex flex-col gap-8">
        {/* Tiêu đề Section & Nút Viết Đánh Giá */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[26px] md:text-[30px] font-bold text-brand-navy tracking-tight">
              Đánh giá & Nhận xét
            </h2>
            <p className="text-body-sm text-neutral-500 mt-1">
              Phản hồi thực tế từ khách hàng đã trải nghiệm sản phẩm và công nghệ may đo Made-to-Measure.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenWriteReview}
            className="self-start sm:self-auto px-6 py-3 bg-[#5D1C34] hover:bg-[#4D172B] text-white rounded-xl font-semibold text-body-sm transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer shrink-0"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Viết đánh giá
          </button>
        </div>

        {/* Khối Tổng quan Rating + Phân bố Sao + Bộ lọc */}
        <RatingOverview
          stats={stats}
          selectedRating={selectedRating}
          onSelectRating={handleSelectRating}
          isLoading={isStatsLoading}
        />

        {/* Danh sách các Review */}
        <div className="flex flex-col gap-4 mt-2">
          {isReviewsLoading && accumulatedReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-400">
              <Loader2 className="w-7 h-7 animate-spin text-brand-navy" />
              <span className="text-body-sm">Đang tải các đánh giá...</span>
            </div>
          ) : accumulatedReviews.length === 0 ? (
            <div className="p-12 text-center bg-white border border-neutral-200/70 rounded-2xl flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-brand-navy text-body-md">
                {selectedRating
                  ? `Chưa có đánh giá ${selectedRating} sao nào`
                  : 'Chưa có đánh giá nào cho sản phẩm này'}
              </h4>
              <p className="text-body-sm text-neutral-500 max-w-md">
                {selectedRating
                  ? 'Hãy thử chọn mức sao khác hoặc xem tất cả đánh giá.'
                  : 'Nếu bạn đã mua và nhận sản phẩm này, hãy là người đầu tiên chia sẻ cảm nhận nhé!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Nút Xem thêm đánh giá (Load More) */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={isReviewsLoading}
                className="px-6 py-2.5 bg-white border border-neutral-300 rounded-xl text-body-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isReviewsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Xem thêm đánh giá ({totalReviews - accumulatedReviews.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Viết / Sửa Review */}
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

      {/* Modal xác nhận xóa của User */}
      {deletingReview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-neutral-200">
            <h4 className="font-bold text-brand-navy text-[18px] mb-2">Xác nhận xóa đánh giá</h4>
            <p className="text-body-sm text-neutral-600 mb-6">
              Bạn có chắc chắn muốn xóa đánh giá này không? Sau khi xóa, bạn có thể đánh giá lại sản phẩm này.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingReview(null)}
                className="px-4 py-2 rounded-xl text-body-sm font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-xl text-body-sm font-semibold bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 cursor-pointer"
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Xóa đánh giá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa của Admin */}
      {adminDeletingReview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-neutral-200">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <ShieldAlert className="w-5 h-5" />
              <h4 className="font-bold text-[18px]">Xóa đánh giá (Quyền Admin)</h4>
            </div>
            <p className="text-body-sm text-neutral-600 mb-6 leading-relaxed">
              Hành động này sẽ gỡ bỏ vĩnh viễn đánh giá của người dùng{' '}
              <strong className="text-neutral-800">{adminDeletingReview.user?.name || 'này'}</strong> khỏi hệ thống.
              Điểm trung bình và số lượng review của sản phẩm sẽ được tự động cập nhật lại.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAdminDeletingReview(null)}
                className="px-4 py-2 rounded-xl text-body-sm font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmAdminDelete}
                disabled={adminDeleteMutation.isPending}
                className="px-4 py-2 rounded-xl text-body-sm font-semibold bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 cursor-pointer"
              >
                {adminDeleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Xác nhận xóa vi phạm
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
