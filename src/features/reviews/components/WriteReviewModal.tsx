'use client';

import { AccountDialog, accountButtonClassName, accountFocusRing, accountInputClassName } from '@/features/profile/components/account-ui';
import { StarRating } from '@/features/reviews/components/StarRating';
import { RATING_LABELS } from '@/features/reviews/constants/write-review-modal';
import { useCreateReview, useUpdateReview } from '@/features/reviews/hooks/useReviews';
import type { WriteReviewModalProps } from '@/features/reviews/types/write-review-modal';
import { cn } from '@/lib/utils';
import { ImagePlus, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const MAX_IMAGES = 5;
const MAX_COMMENT = 1000;

export function WriteReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  productImage,
  orderId,
  editingReview,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const createMutation = useCreateReview();
  const updateMutation = useUpdateReview();

  const isEditing = !!editingReview;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (editingReview) {
      setRating(editingReview.rating || 5);
      setComment(editingReview.comment || '');
      setImageUrls(editingReview.images || []);
    } else {
      setRating(5);
      setComment('');
      setImageUrls([]);
    }
  }, [editingReview, isOpen]);

  // Xử lý chọn ảnh từ máy và convert sang URL xem trước
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (imageUrls.length + files.length > MAX_IMAGES) {
      toast.error('Tối đa 5 hình ảnh cho mỗi đánh giá');
      return;
    }

    setIsUploading(true);
    try {
      const readers = Array.from(files).map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const base64List = await Promise.all(readers);
      setImageUrls((prev) => [...prev, ...base64List]);
    } catch {
      toast.error('Có lỗi khi đọc file ảnh');
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleAddCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    if (!customUrlInput.startsWith('http://') && !customUrlInput.startsWith('https://')) {
      toast.error('Vui lòng nhập đường dẫn URL ảnh hợp lệ (http/https)');
      return;
    }
    if (imageUrls.length >= MAX_IMAGES) {
      toast.error('Tối đa 5 hình ảnh cho mỗi đánh giá');
      return;
    }
    setImageUrls((prev) => [...prev, customUrlInput.trim()]);
    setCustomUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating || rating < 1 || rating > 5) {
      toast.error('Vui lòng chọn số sao đánh giá (1 - 5 sao)');
      return;
    }

    if (comment.trim().length > MAX_COMMENT) {
      toast.error('Nội dung nhận xét không được vượt quá 1000 ký tự');
      return;
    }

    try {
      if (isEditing && editingReview) {
        await updateMutation.mutateAsync({
          id: editingReview.id,
          productId,
          rating,
          comment: comment.trim() || undefined,
          images: imageUrls,
        });
        toast.success('Đã cập nhật nhận xét');
      } else {
        await createMutation.mutateAsync({
          productId,
          orderId,
          rating,
          comment: comment.trim() || undefined,
          images: imageUrls,
        });
        toast.success('Cảm ơn bạn đã gửi đánh giá');
      }
      onClose();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string | string[] } }; message?: string };
      const msg =
        errObj?.response?.data?.message ||
        errObj?.message ||
        'Không thể gửi đánh giá. Vui lòng thử lại sau.';
      toast.error(typeof msg === 'string' ? msg : msg[0] ?? 'Không thể gửi đánh giá. Vui lòng thử lại sau.');
    }
  };

  return (
    <AccountDialog
      open={isOpen}
      onOpenChange={(open) => { if (!open && !isSubmitting) onClose(); }}
      eyebrow={isEditing ? 'Sửa đánh giá' : 'Đánh giá sản phẩm'}
      title={productName}
      className="sm:max-w-[520px]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {productImage ? (
          <div className="flex items-center gap-3">
            <span className="relative h-[72px] w-14 shrink-0 overflow-hidden rounded-[2px] bg-landing-ivory">
              <Image src={productImage} alt={productName} fill sizes="56px" className="object-cover" unoptimized={productImage.startsWith('data:')} />
            </span>
            <p className="text-sm text-landing-muted">Đánh giá dựa trên sản phẩm bạn đã nhận.</p>
          </div>
        ) : null}

        <fieldset className="border-y border-landing-line py-5 text-center">
          <legend className="sr-only">Số sao</legend>
          <p className="text-sm text-landing-obsidian">Bạn thấy sản phẩm thế nào?</p>
          <StarRating value={rating} onChange={setRating} size="lg" readOnly={false} tone="landing" className="mt-3" />
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-landing-oxblood" aria-live="polite">
            {RATING_LABELS[rating] || ''}
          </p>
        </fieldset>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <label htmlFor="review-comment" className="text-sm font-medium text-landing-obsidian">
              Nhận xét <span className="font-normal text-landing-muted">(không bắt buộc)</span>
            </label>
            <span className="font-mono text-[11px] text-landing-muted">
              {comment.length}/{MAX_COMMENT}
            </span>
          </div>
          <textarea
            id="review-comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chất liệu vải, đường may, độ vừa với số đo, giao hàng…"
            className={cn(accountInputClassName, 'h-auto resize-none py-3 leading-relaxed')}
            maxLength={MAX_COMMENT}
          />
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium text-landing-obsidian">
              Ảnh thực tế <span className="font-mono text-[11px] font-normal text-landing-muted">{imageUrls.length}/{MAX_IMAGES}</span>
            </p>
            {!showUrlInput && imageUrls.length < MAX_IMAGES ? (
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className={cn('text-xs text-landing-oxblood underline-offset-4 hover:underline', accountFocusRing)}
              >
                Dán link ảnh
              </button>
            ) : null}
          </div>

          {showUrlInput ? (
            <div className="mb-3 flex items-center gap-2">
              <input
                type="url"
                aria-label="Link ảnh"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://…"
                className={accountInputClassName}
              />
              <button type="button" onClick={handleAddCustomUrl} className={accountButtonClassName('outline', 'sm')}>
                Thêm
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                aria-label="Đóng ô nhập link"
                className={cn('flex h-9 w-9 shrink-0 items-center justify-center text-landing-muted hover:text-landing-oxblood', accountFocusRing)}
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            {imageUrls.map((url, idx) => (
              <div key={`${idx}-${url.slice(-16)}`} className="relative h-16 w-16 overflow-hidden rounded-[2px] border border-landing-line bg-landing-ivory">
                <Image src={url} alt={`Ảnh ${idx + 1}`} fill sizes="64px" className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  aria-label={`Xóa ảnh ${idx + 1}`}
                  className={cn('absolute right-0 top-0 flex h-6 w-6 items-center justify-center bg-landing-obsidian/70 text-landing-paper hover:bg-destructive', accountFocusRing)}
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            ))}

            {imageUrls.length < MAX_IMAGES ? (
              <label
                className={cn(
                  'flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-[2px] border border-dashed border-landing-taupe text-landing-muted transition-colors hover:border-landing-oxblood hover:text-landing-oxblood',
                  'focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-landing-oxblood',
                )}
              >
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="sr-only" disabled={isUploading} />
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.75} />
                ) : (
                  <>
                    <ImagePlus className="h-4 w-4" strokeWidth={1.75} />
                    <span className="text-[10px]">Tải ảnh</span>
                  </>
                )}
              </label>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-landing-line pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={isSubmitting} className={accountButtonClassName('outline')}>
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !rating || rating < 1 || rating > 5 || comment.length > MAX_COMMENT}
            className={accountButtonClassName('primary')}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} /> : null}
            {isEditing ? 'Lưu thay đổi' : 'Gửi đánh giá'}
          </button>
        </div>
      </form>
    </AccountDialog>
  );
}
