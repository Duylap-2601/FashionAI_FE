'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Review,
  useCreateReview,
  useUpdateReview,
} from '@/hooks/useReviews';
import { StarRating } from './StarRating';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productImage?: string;
  orderId?: string;
  editingReview?: Review | null;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Rất không hài lòng',
  2: 'Không hài lòng',
  3: 'Bình thường',
  4: 'Hài lòng, vừa vặn',
  5: 'Cực kỳ ưng ý & chất lượng',
};

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

  if (!isOpen) return null;

  // Xử lý chọn ảnh từ máy và convert sang URL xem trước
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (imageUrls.length + files.length > 5) {
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
    if (imageUrls.length >= 5) {
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

    if (comment.trim().length > 1000) {
      toast.error('Nội dung nhận xét không được vượt quá 1000 ký tự');
      return;
    }

    try {
      if (isEditing && editingReview) {
        // Cập nhật review (chỉ sửa comment & images)
        await updateMutation.mutateAsync({
          id: editingReview.id,
          productId,
          comment: comment.trim() || undefined,
          images: imageUrls,
        });
        toast.success('Cập nhật nhận xét thành công!');
      } else {
        // Tạo review mới
        await createMutation.mutateAsync({
          productId,
          orderId,
          rating,
          comment: comment.trim() || undefined,
          images: imageUrls,
        });
        toast.success('Cảm ơn bạn đã gửi đánh giá sản phẩm!');
      }
      onClose();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string | string[] } }; message?: string };
      const msg =
        errObj?.response?.data?.message ||
        errObj?.message ||
        'Không thể gửi đánh giá. Vui lòng thử lại sau.';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h3 className="text-[18px] font-bold text-brand-navy">
            {isEditing ? 'Chỉnh sửa nhận xét' : 'Đánh giá sản phẩm'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
          {/* Thông tin sản phẩm vắn tắt */}
          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            {productImage && (
              <img
                src={productImage}
                alt={productName}
                className="w-12 h-12 rounded-lg object-cover border border-neutral-200 shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Đang đánh giá
              </div>
              <div className="font-semibold text-brand-navy text-body-sm truncate">
                {productName}
              </div>
            </div>
          </div>

          {/* Chọn số sao Rating */}
          <div className="flex flex-col items-center justify-center p-4 bg-amber-50/50 border border-amber-200/60 rounded-xl text-center">
            <span className="text-body-sm font-semibold text-neutral-800 mb-2">
              {isEditing
                ? 'Số sao đánh giá (Không thể thay đổi sau khi gửi)'
                : 'Bạn cảm nhận thế nào về sản phẩm?'}
            </span>

            <StarRating
              value={rating}
              onChange={isEditing ? undefined : setRating}
              size="lg"
              readOnly={isEditing}
              className="py-1"
            />

            <span className="text-body-sm font-bold text-amber-700 mt-2">
              {RATING_LABELS[rating] || ''}
            </span>
          </div>

          {/* Nhập nội dung nhận xét */}
          <div className="flex flex-col gap-2">
            <label className="text-label-sm font-semibold text-neutral-700">
              Nhận xét chi tiết <span className="text-neutral-400 font-normal">(Tùy chọn)</span>
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm về chất liệu vải, đường may, độ vừa vặn số đo hoặc dịch vụ giao hàng..."
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-body-sm text-neutral-800 focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy resize-none"
              maxLength={1000}
            />
            <div className="text-[12px] text-neutral-400 text-right">
              {comment.length} / 1000 ký tự
            </div>
          </div>

          {/* Thêm hình ảnh thực tế */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-label-sm font-semibold text-neutral-700">
                Hình ảnh thực tế <span className="text-neutral-400 font-normal">({imageUrls.length}/5 ảnh)</span>
              </label>
              {!showUrlInput && imageUrls.length < 5 && (
                <button
                  type="button"
                  onClick={() => setShowUrlInput(true)}
                  className="text-[12px] text-brand-navy hover:underline cursor-pointer"
                >
                  + Dán link URL ảnh
                </button>
              )}
            </div>

            {/* Form nhập link URL trực tiếp nếu cần */}
            {showUrlInput && (
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://example.com/anh-review.jpg"
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-body-sm focus:outline-none focus:border-brand-navy"
                />
                <button
                  type="button"
                  onClick={handleAddCustomUrl}
                  className="px-3 py-2 bg-brand-navy text-white text-body-sm rounded-lg hover:bg-brand-navy/90 cursor-pointer"
                >
                  Thêm
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(false)}
                  className="p-2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Gallery ảnh xem trước & Nút upload */}
            <div className="flex items-center gap-3 flex-wrap">
              {imageUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative w-16 h-16 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 group"
                >
                  <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Xóa ảnh này"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}

              {imageUrls.length < 5 && (
                <label className="w-16 h-16 rounded-xl border-2 border-dashed border-neutral-300 hover:border-brand-navy flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-brand-navy cursor-pointer transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-brand-navy" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span className="text-[10px] font-medium">Tải ảnh</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-neutral-200 text-body-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !rating || rating < 1 || rating > 5 || comment.length > 1000}
              className="px-6 py-2.5 rounded-xl bg-brand-navy text-white text-body-sm font-semibold hover:bg-brand-navy/90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Lưu thay đổi' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
