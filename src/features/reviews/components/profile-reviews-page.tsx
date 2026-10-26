'use client';

import { AccountShell } from '@/features/profile/components/account-shell';
import {
  AccountConfirmDialog,
  AccountPagination,
  AccountStatePanel,
  accountButtonClassName,
  accountFocusRing,
} from '@/features/profile/components/account-ui';
import { StarRating } from '@/features/reviews/components/StarRating';
import { WriteReviewModal } from '@/features/reviews/components/WriteReviewModal';
import { useDeleteReview, useMyReviews } from '@/features/reviews/hooks/useReviews';
import type { Review } from '@/features/reviews/types/reviews';
import { cn } from '@/lib/utils';
import { MessageSquare, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

function formatDate(iso?: string) {
  return iso ? new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
}

function getReviewProductImage(review: Review) {
  return review.product?.garmentUrl || review.product?.image || null;
}

function ReviewRow({ review, onEdit, onDelete }: { review: Review; onEdit: () => void; onDelete: () => void }) {
  const productImage = getReviewProductImage(review);
  const productName = review.product?.name || 'Sản phẩm đã mua';
  const edited = review.updatedAt && review.createdAt && review.updatedAt !== review.createdAt;

  return (
    <article className="grid grid-cols-[56px_minmax(0,1fr)] gap-x-4 gap-y-3 py-6 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:gap-x-6">
      <Link
        href={`/products/${review.productId}`}
        aria-hidden="true"
        tabIndex={-1}
        className="relative row-span-2 block h-[72px] w-14 overflow-hidden rounded-[2px] bg-landing-ivory sm:h-24 sm:w-[72px]"
      >
        {productImage ? (
          <Image src={productImage} alt="" fill sizes="72px" className="object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-landing-muted">
            <MessageSquare className="h-5 w-5" strokeWidth={1.75} />
          </span>
        )}
      </Link>

      <div className="min-w-0">
        <Link
          href={`/products/${review.productId}`}
          className={cn('product-name-line line-clamp-2 text-landing-obsidian transition-colors hover:text-landing-oxblood', accountFocusRing)}
        >
          {productName}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <StarRating value={review.rating} size="xs" readOnly tone="landing" />
          <span className="sr-only">{review.rating} trên 5 sao</span>
          <span className="font-mono text-[11px] text-landing-muted">
            {formatDate(review.createdAt)}
            {edited ? ' · đã sửa' : ''}
          </span>
        </div>
      </div>

      <div className="col-start-2 flex gap-2 sm:col-start-3 sm:row-start-1 sm:justify-self-end">
        <button type="button" onClick={onEdit} className={accountButtonClassName('outline', 'sm')}>
          <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
          Sửa
        </button>
        <button type="button" onClick={onDelete} className={accountButtonClassName('danger', 'sm')}>
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
          Xóa
        </button>
      </div>

      <div className="col-span-2 min-w-0 sm:col-span-2 sm:col-start-2">
        {review.comment ? (
          <p className="max-w-2xl whitespace-pre-line text-landing-body text-landing-obsidian/85">{review.comment}</p>
        ) : (
          <p className="text-sm italic text-landing-muted">Bạn chỉ chấm sao, không viết nhận xét.</p>
        )}

        {Array.isArray(review.images) && review.images.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Ảnh đính kèm">
            {review.images.map((imageUrl, idx) => {
              const thumb = (
                <Image src={imageUrl} alt={`Ảnh ${idx + 1} của đánh giá`} fill sizes="64px" className="object-cover" unoptimized={imageUrl.startsWith('data:')} />
              );
              return (
                <li key={`${idx}-${imageUrl.slice(-16)}`} className="relative h-16 w-16 overflow-hidden rounded-[2px] border border-landing-line bg-landing-ivory">
                  {/* Trình duyệt chặn mở ảnh data: ở tab mới, nên chỉ ảnh http(s) mới là link. */}
                  {imageUrl.startsWith('http') ? (
                    <a href={imageUrl} target="_blank" rel="noreferrer" className={cn('block h-full w-full', accountFocusRing)}>
                      {thumb}
                    </a>
                  ) : (
                    thumb
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

export default function MyReviewsPage() {
  const [page, setPage] = useState<number>(1);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);

  const { reviews, meta, isLoading, isError, refetch } = useMyReviews({ page, limit: PAGE_SIZE });
  const deleteMutation = useDeleteReview();

  const confirmDelete = async () => {
    if (!deletingReview) return;
    try {
      await deleteMutation.mutateAsync({
        id: deletingReview.id,
        productId: deletingReview.productId,
      });
      toast.success('Đã xóa đánh giá');
      setDeletingReview(null);
      refetch();
    } catch {
      toast.error('Không thể xóa đánh giá. Vui lòng thử lại.');
    }
  };

  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? reviews.length;

  return (
    <AccountShell title="Đánh giá của tôi" description="Nhận xét bạn đã gửi cho những sản phẩm đã nhận. Bạn có thể sửa hoặc xóa bất cứ lúc nào.">
      {isLoading ? (
        <div className="divide-y divide-landing-line border-t border-landing-line" aria-hidden="true">
          {[0, 1, 2].map((key) => (
            <div key={key} className="flex gap-6 py-6">
              <div className="h-24 w-[72px] animate-pulse bg-landing-taupe/40" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-1/2 animate-pulse bg-landing-taupe/40" />
                <div className="h-3 w-1/4 animate-pulse bg-landing-taupe/30" />
                <div className="h-3 w-3/4 animate-pulse bg-landing-taupe/30" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <AccountStatePanel
          tone="error"
          title="Không tải được đánh giá"
          description="Kiểm tra kết nối rồi thử lại."
          action={
            <button type="button" onClick={() => refetch()} className={accountButtonClassName('outline')}>
              Thử lại
            </button>
          }
        />
      ) : reviews.length === 0 ? (
        <AccountStatePanel
          title="Bạn chưa có đánh giá nào"
          description="Khi đơn may đo hoàn tất, bạn có thể đánh giá từng sản phẩm trong mục Đơn hàng."
          action={
            <Link href="/profile/orders" className={accountButtonClassName('primary')}>
              Xem đơn hàng
            </Link>
          }
        />
      ) : (
        <>
          <p className="mb-2 text-xs text-landing-muted">
            <span className="font-mono text-landing-obsidian">{total}</span> đánh giá
          </p>
          <div className="divide-y divide-landing-line border-y border-landing-line">
            {reviews.map((review) => (
              <ReviewRow key={review.id} review={review} onEdit={() => setEditingReview(review)} onDelete={() => setDeletingReview(review)} />
            ))}
          </div>
          <AccountPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {editingReview ? (
        <WriteReviewModal
          isOpen
          onClose={() => setEditingReview(null)}
          productId={editingReview.productId}
          productName={editingReview.product?.name || 'Sản phẩm'}
          productImage={getReviewProductImage(editingReview) || undefined}
          editingReview={editingReview}
        />
      ) : null}

      <AccountConfirmDialog
        open={deletingReview !== null}
        onOpenChange={(open) => { if (!open) setDeletingReview(null); }}
        title="Xóa đánh giá?"
        description="Đánh giá sẽ biến mất khỏi trang sản phẩm. Sau khi xóa, bạn có thể gửi đánh giá mới."
        confirmLabel="Xóa đánh giá"
        isPending={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </AccountShell>
  );
}
