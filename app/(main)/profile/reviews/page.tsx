'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, MessageSquare,
  Edit3, Trash2, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useMyReviews, useDeleteReview, Review } from '@/hooks/useReviews';
import { StarRating } from '@/components/reviews/StarRating';
import { WriteReviewModal } from '@/components/reviews/WriteReviewModal';

export default function MyReviewsPage() {
  const [page, setPage] = useState<number>(1);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);

  const { reviews, meta, isLoading, refetch } = useMyReviews({ page, limit: 10 });
  const deleteMutation = useDeleteReview();

  const confirmDelete = async () => {
    if (!deletingReview) return;
    try {
      await deleteMutation.mutateAsync({
        id: deletingReview.id,
        productId: deletingReview.productId,
      });
      toast.success('Đã xóa đánh giá của bạn');
      setDeletingReview(null);
      refetch();
    } catch {
      toast.error('Không thể xóa đánh giá. Vui lòng thử lại.');
    }
  };

  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="min-h-screen bg-brand-cream pb-16 md:pb-12">
      {/* Page header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-[900px] mx-auto px-4 md:px-8 py-6 md:py-8">
          <div className="flex items-center gap-2 text-label-sm text-neutral-500 mb-3">
            <Link href="/profile" className="hover:text-brand-navy transition-colors flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" /> Hồ sơ cá nhân
            </Link>
            <span>/</span>
            <span className="text-brand-navy font-medium">Đánh giá của tôi</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-h1 font-bold text-brand-navy">Đánh giá của tôi</h1>
              <p className="text-body-sm text-neutral-500 mt-1">
                Xem lại lịch sử đánh giá và cảm nhận thực tế về các sản phẩm bạn đã mua.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 md:px-8 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-8 h-8 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-navy/5 text-brand-navy flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-[20px] font-bold text-brand-navy mb-2">Bạn chưa có đánh giá nào</h3>
            <p className="text-body-sm text-neutral-500 max-w-sm mb-6">
              Sau khi nhận hàng từ các đơn đặt may, bạn có thể vào mục Đơn hàng để đánh giá chất lượng sản phẩm nhé.
            </p>
            <Link
              href="/profile/orders"
              className="px-6 py-2.5 bg-brand-navy text-white rounded-xl text-body-sm font-semibold hover:bg-brand-navy/90 transition-colors"
            >
              Xem danh sách đơn hàng
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((r) => {
              const formattedDate = r.createdAt
                ? new Date(r.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                : '';

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col gap-4 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  {/* Top row: Product info + Action buttons */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-100">
                    <div className="flex items-center gap-3 min-w-0">
                      {(r.product?.garmentUrl || r.product?.image) ? (
                        <img
                          src={r.product.garmentUrl || r.product.image || ''}
                          alt={r.product?.name || ''}
                          className="w-12 h-14 rounded-lg object-cover border border-neutral-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-14 rounded-lg bg-neutral-100 border border-neutral-200 shrink-0 flex items-center justify-center text-neutral-400">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/products/${r.productId}`}
                          className="font-bold text-brand-navy hover:underline text-body-md truncate block"
                        >
                          {r.product?.name || 'Sản phẩm đã mua'}
                        </Link>
                        <div className="text-[12px] text-neutral-400 mt-0.5">
                          Đã đánh giá vào ngày {formattedDate}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingReview(r)}
                        className="p-2 text-neutral-500 hover:text-brand-navy hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa nhận xét"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingReview(r)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa đánh giá này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div>
                    <StarRating value={r.rating} size="sm" readOnly showValue />
                  </div>

                  {/* Comment */}
                  {r.comment ? (
                    <p className="text-body-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                      {r.comment}
                    </p>
                  ) : (
                    <p className="text-body-sm text-neutral-400 italic">
                      Bạn không để lại nhận xét bằng chữ.
                    </p>
                  )}

                  {/* Images */}
                  {Array.isArray(r.images) && r.images.length > 0 && (
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {r.images.map((imgUrl, idx) => (
                        <a
                          key={idx}
                          href={imgUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-16 h-16 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 hover:opacity-90 transition-opacity"
                        >
                          <img
                            src={imgUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-xl border border-neutral-200 bg-white text-neutral-600 disabled:opacity-40 hover:bg-neutral-50 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-body-sm text-neutral-600 px-3 font-medium">
                  Trang {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-xl border border-neutral-200 bg-white text-neutral-600 disabled:opacity-40 hover:bg-neutral-50 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Sửa nhận xét */}
      {editingReview && (
        <WriteReviewModal
          isOpen={!!editingReview}
          onClose={() => setEditingReview(null)}
          productId={editingReview.productId}
          productName={editingReview.product?.name || 'Sản phẩm'}
          productImage={editingReview.product?.garmentUrl || editingReview.product?.image || undefined}
          editingReview={editingReview}
        />
      )}

      {/* Modal xác nhận xóa */}
      {deletingReview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-neutral-200">
            <h4 className="font-bold text-brand-navy text-[18px] mb-2">Xác nhận xóa đánh giá</h4>
            <p className="text-body-sm text-neutral-600 mb-6">
              Bạn có chắc chắn muốn xóa đánh giá cho sản phẩm này? Sau khi xóa, bạn có thể gửi lại đánh giá mới.
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
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
