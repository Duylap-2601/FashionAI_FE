'use client';

import { AccountConfirmDialog } from '@/features/profile/components/account-ui';
import { StarRating } from '@/features/reviews/components/StarRating';
import { useCreateReply, useDeleteReply, useReviewReplies, useUpdateReply } from '@/features/reviews/hooks/useReviews';
import type { ReviewCardProps } from '@/features/reviews/types/review-card';
import type { ReviewReply } from '@/features/reviews/types/reviews';
import { cn } from '@/lib/utils';
import * as Dialog from '@radix-ui/react-dialog';
import {
  CheckCircle2,
  CornerDownRight,
  Edit3,
  Loader2,
  MessageSquare,
  MoreVertical,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { toast } from 'sonner';

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood';
const labelText = 'text-[10px] font-semibold uppercase tracking-[0.14em]';

export function ReviewCard({
  review,
  currentUserId,
  isAdmin = false,
  onEdit,
  onDelete,
  onAdminDelete,
}: ReviewCardProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyText, setEditReplyText] = useState('');
  const [replyToDelete, setReplyToDelete] = useState<ReviewReply | null>(null);

  const { replies: fetchedReplies } = useReviewReplies(review.id);
  const createReplyMutation = useCreateReply();
  const updateReplyMutation = useUpdateReply();
  const deleteReplyMutation = useDeleteReply();

  const replies = fetchedReplies.length > 0 ? fetchedReplies : (review.replies || []);

  const isAuthor = currentUserId && review.userId === currentUserId;
  const avatarUrl = review.user?.avatarUrl || null;

  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    : '';

  const userName = review.user?.name || 'Khách hàng';
  const initial = (userName.trim()[0] || 'K').toUpperCase();

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      toast.error('Vui lòng đăng nhập để gửi phản hồi');
      return;
    }

    const trimmed = replyText.trim();
    if (!trimmed) {
      toast.error('Vui lòng nhập nội dung phản hồi');
      return;
    }

    if (trimmed.length > 1000) {
      toast.error('Nội dung phản hồi không được vượt quá 1000 ký tự');
      return;
    }

    try {
      await createReplyMutation.mutateAsync({
        reviewId: review.id,
        comment: trimmed,
        productId: review.productId,
      });
      toast.success('Đã gửi phản hồi thành công');
      setReplyText('');
      setShowReplyForm(false);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(errObj?.response?.data?.message || errObj?.message || 'Không thể gửi phản hồi.');
    }
  };

  const handleStartEditReply = (rep: ReviewReply) => {
    setEditingReplyId(rep.id);
    setEditReplyText(rep.content || rep.comment || '');
  };

  const handleSaveEditReply = async (replyId: string) => {
    const trimmed = editReplyText.trim();
    if (!trimmed) {
      toast.error('Nội dung phản hồi không được để trống');
      return;
    }

    if (trimmed.length > 1000) {
      toast.error('Nội dung phản hồi không được vượt quá 1000 ký tự');
      return;
    }

    try {
      await updateReplyMutation.mutateAsync({
        id: replyId,
        comment: trimmed,
        reviewId: review.id,
        productId: review.productId,
      });
      toast.success('Cập nhật phản hồi thành công');
      setEditingReplyId(null);
    } catch {
      toast.error('Không thể cập nhật phản hồi.');
    }
  };

  const confirmDeleteReply = async () => {
    if (!replyToDelete) return;
    try {
      await deleteReplyMutation.mutateAsync({
        id: replyToDelete.id,
        reviewId: review.id,
        productId: review.productId,
      });
      toast.success('Đã xóa phản hồi');
      setReplyToDelete(null);
    } catch {
      toast.error('Không thể xóa phản hồi.');
    }
  };

  return (
    <>
      <article className="flex flex-col gap-4 border border-landing-line bg-landing-paper p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {avatarUrl ? (
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-landing-line bg-landing-ivory">
                <Image
                  src={avatarUrl}
                  alt={userName}
                  fill
                  sizes="40px"
                  unoptimized={avatarUrl.startsWith('data:')}
                  className="object-cover"
                />
              </span>
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-landing-line bg-landing-paper text-sm font-semibold text-landing-brass-ink">
                {initial}
              </span>
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-semibold text-landing-obsidian">{userName}</span>
                <span className={cn('inline-flex items-center gap-1 text-landing-sage-ink', labelText)}>
                  <CheckCircle2 className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
                  Đã mua hàng
                </span>
              </div>
              <p className="mt-0.5 font-mono text-[10px] text-landing-muted">{formattedDate}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <StarRating value={review.rating} size="sm" readOnly tone="landing" />

            {(isAuthor || isAdmin) && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label="Tùy chọn đánh giá"
                  aria-expanded={menuOpen}
                  className={cn('flex h-9 w-9 items-center justify-center text-landing-muted transition-colors hover:text-landing-oxblood', focusRing)}
                >
                  <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
                </button>

                {menuOpen && (
                  <div
                    className="absolute right-0 top-10 z-20 w-48 border border-landing-line bg-landing-paper py-1 text-sm"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    {isAuthor && onEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onEdit(review);
                        }}
                        className={cn('flex w-full items-center gap-2 px-3 py-2 text-left text-landing-muted transition-colors hover:bg-landing-ivory hover:text-landing-obsidian', focusRing)}
                      >
                        <Edit3 className="h-4 w-4" strokeWidth={1.75} />
                        Chỉnh sửa
                      </button>
                    )}

                    {isAuthor && onDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete(review);
                        }}
                        className={cn('flex w-full items-center gap-2 px-3 py-2 text-left text-destructive transition-colors hover:bg-destructive/10', focusRing)}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                        Xóa đánh giá
                      </button>
                    )}

                    {isAdmin && onAdminDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onAdminDelete(review);
                        }}
                        className={cn('flex w-full items-center gap-2 border-t border-landing-line px-3 py-2 text-left text-destructive transition-colors hover:bg-destructive/10', focusRing)}
                      >
                        <ShieldAlert className="h-4 w-4" strokeWidth={1.75} />
                        Xóa (quyền Admin)
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {review.comment ? (
          <p className="text-sm leading-relaxed text-landing-muted whitespace-pre-line">{review.comment}</p>
        ) : (
          <p className="text-xs italic text-landing-muted">Người mua không để lại nhận xét bằng chữ.</p>
        )}

        {Array.isArray(review.images) && review.images.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {review.images.map((imgUrl, idx) => (
              <button
                key={`${imgUrl}-${idx}`}
                type="button"
                onClick={() => setSelectedImage(imgUrl)}
                aria-label={`Xem ảnh đánh giá ${idx + 1}`}
                className={cn('relative h-20 w-20 overflow-hidden rounded-[2px] border border-landing-line bg-landing-ivory transition-opacity hover:opacity-90', focusRing)}
              >
                <Image
                  src={imgUrl}
                  alt={`Ảnh đánh giá ${idx + 1}`}
                  fill
                  sizes="80px"
                  unoptimized
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="mt-1 flex flex-col gap-3 border-t border-landing-line pt-3">
          {replies.length > 0 && (
            <div className="flex flex-col gap-2.5">
              {replies.map((rep) => {
                const isShop =
                  rep.user?.role === 'ADMIN' ||
                  rep.user?.name?.toLowerCase().includes('shop') ||
                  rep.user?.name?.toLowerCase().includes('stale');
                const canManageReply = (currentUserId && rep.userId === currentUserId) || isAdmin;
                const repDate = rep.createdAt
                  ? new Date(rep.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                  : '';

                return (
                  <div
                    key={rep.id}
                    className={cn(
                      'flex flex-col gap-1.5 border p-3.5',
                      isShop ? 'border-landing-oxblood/25 bg-landing-ivory' : 'border-landing-line bg-landing-ivory/60',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {isShop ? (
                          <span className={cn('bg-landing-oxblood px-2 py-0.5 text-landing-paper', labelText)}>
                            Phản hồi từ shop
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-landing-obsidian">
                            {rep.user?.name || 'Thành viên'}
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-landing-muted">{repDate}</span>
                      </div>

                      {canManageReply && editingReplyId !== rep.id && (
                        <div className="flex items-center gap-1">
                          {rep.userId === currentUserId && (
                            <button
                              type="button"
                              onClick={() => handleStartEditReply(rep)}
                              aria-label="Chỉnh sửa phản hồi"
                              className={cn('flex h-8 w-8 items-center justify-center text-landing-muted transition-colors hover:text-landing-oxblood', focusRing)}
                            >
                              <Edit3 className="h-3.5 w-3.5" strokeWidth={1.75} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setReplyToDelete(rep)}
                            aria-label="Xóa phản hồi"
                            className={cn('flex h-8 w-8 items-center justify-center text-landing-muted transition-colors hover:text-destructive', focusRing)}
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </button>
                        </div>
                      )}
                    </div>

                    {editingReplyId === rep.id ? (
                      <div className="mt-1 flex flex-col gap-2">
                        <textarea
                          rows={2}
                          value={editReplyText}
                          onChange={(e) => setEditReplyText(e.target.value)}
                          maxLength={1000}
                          className={cn('w-full resize-none rounded-[2px] border border-landing-line bg-landing-paper px-3 py-2 text-sm text-landing-obsidian', focusRing)}
                        />
                        <div className="flex items-center justify-between text-[10px] text-landing-muted">
                          <span className="font-mono">{editReplyText.length}/1000</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingReplyId(null)}
                              className={cn('px-2.5 py-1 text-landing-muted transition-colors hover:text-landing-obsidian', focusRing)}
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEditReply(rep.id)}
                              disabled={updateReplyMutation.isPending}
                              className={cn('rounded-[2px] bg-landing-oxblood px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-landing-paper transition-colors hover:bg-landing-obsidian disabled:opacity-50', focusRing)}
                            >
                              {updateReplyMutation.isPending ? 'Đang lưu' : 'Lưu'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed text-landing-muted whitespace-pre-line">
                        {rep.content || rep.comment}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!showReplyForm ? (
            <button
              type="button"
              onClick={() => {
                if (!currentUserId) {
                  toast.error('Vui lòng đăng nhập để gửi phản hồi');
                  return;
                }
                setShowReplyForm(true);
              }}
              className={cn('flex w-fit items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-landing-oxblood transition-colors hover:underline', focusRing)}
            >
              <CornerDownRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              Trả lời
            </button>
          ) : (
            <form onSubmit={handleSubmitReply} className="flex flex-col gap-2 border border-landing-line bg-landing-ivory p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-landing-obsidian">
                  <MessageSquare className="h-3.5 w-3.5 text-landing-oxblood" strokeWidth={1.75} aria-hidden="true" />
                  {isAdmin ? 'Phản hồi với tư cách quản trị viên' : 'Gửi câu trả lời của bạn'}
                </span>
                <span className="font-mono text-[10px] text-landing-muted">{replyText.length}/1000</span>
              </div>

              <textarea
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Viết phản hồi chi tiết về đánh giá này."
                maxLength={1000}
                className={cn('w-full resize-none rounded-[2px] border border-landing-line bg-landing-paper px-3 py-2 text-sm text-landing-obsidian placeholder:text-landing-muted/70', focusRing)}
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyText('');
                  }}
                  className={cn('px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-landing-muted transition-colors hover:text-landing-obsidian', focusRing)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createReplyMutation.isPending || !replyText.trim() || replyText.length > 1000}
                  className={cn('inline-flex items-center gap-1.5 rounded-[2px] bg-landing-oxblood px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-landing-paper transition-colors hover:bg-landing-obsidian disabled:opacity-50', focusRing)}
                >
                  {createReplyMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.75} />}
                  Gửi phản hồi
                </button>
              </div>
            </form>
          )}
        </div>
      </article>

      <AccountConfirmDialog
        open={Boolean(replyToDelete)}
        onOpenChange={(open) => { if (!open) setReplyToDelete(null); }}
        title="Xóa phản hồi"
        description="Phản hồi này sẽ bị gỡ khỏi đánh giá. Bạn có chắc chắn muốn tiếp tục?"
        confirmLabel="Xóa phản hồi"
        isPending={deleteReplyMutation.isPending}
        onConfirm={confirmDeleteReply}
      />

      <Dialog.Root open={Boolean(selectedImage)} onOpenChange={(open) => { if (!open) setSelectedImage(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-landing-obsidian/95 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed inset-0 z-[101] flex items-center justify-center p-4 focus:outline-none">
            <Dialog.Title className="sr-only">Ảnh đánh giá</Dialog.Title>
            <Dialog.Description className="sr-only">Ảnh thực tế từ khách hàng.</Dialog.Description>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              aria-label="Đóng ảnh"
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center border border-landing-paper/20 bg-landing-obsidian/70 text-landing-paper transition-colors hover:border-landing-brass hover:text-landing-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-brass"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
            {selectedImage ? (
              <div className="relative h-[80vh] w-[min(90vw,900px)]">
                <Image
                  src={selectedImage}
                  alt="Ảnh đánh giá"
                  fill
                  sizes="90vw"
                  unoptimized
                  className="object-contain"
                />
              </div>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
