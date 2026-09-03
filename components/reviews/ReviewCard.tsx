'use client';

import React, { useState } from 'react';
import {
  CheckCircle2, MoreVertical, Trash2, Edit3, ShieldAlert,
  X, CornerDownRight, MessageSquare, Loader2, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Review,
  ReviewReply,
  useReviewReplies,
  useCreateReply,
  useUpdateReply,
  useDeleteReply,
} from '@/hooks/useReviews';
import { StarRating } from './StarRating';

interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  isAdmin?: boolean;
  onEdit?: (review: Review) => void;
  onDelete?: (review: Review) => void;
  onAdminDelete?: (review: Review) => void;
}

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

  // Trạng thái phản hồi (Replies)
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyText, setEditReplyText] = useState('');

  const { replies: fetchedReplies } = useReviewReplies(review.id);
  const createReplyMutation = useCreateReply();
  const updateReplyMutation = useUpdateReply();
  const deleteReplyMutation = useDeleteReply();

  const replies = fetchedReplies.length > 0 ? fetchedReplies : (review.replies || []);

  const isAuthor = currentUserId && review.userId === currentUserId;

  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '';

  const userName = review.user?.name || 'Khách hàng';
  const initial = (userName.trim()[0] || 'K').toUpperCase();

  // Xử lý gửi phản hồi mới
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

  // Bắt đầu sửa reply
  const handleStartEditReply = (rep: ReviewReply) => {
    setEditingReplyId(rep.id);
    setEditReplyText(rep.comment);
  };

  // Lưu chỉnh sửa reply
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

  // Xóa reply
  const handleDeleteReply = async (replyId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phản hồi này?')) return;
    try {
      await deleteReplyMutation.mutateAsync({
        id: replyId,
        reviewId: review.id,
        productId: review.productId,
      });
      toast.success('Đã xóa phản hồi');
    } catch {
      toast.error('Không thể xóa phản hồi.');
    }
  };

  return (
    <>
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 flex flex-col gap-4 transition-all hover:shadow-xs">
        {/* Header: User Avatar + Name + Stars + Action Dropdown */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {review.user?.avatarUrl ? (
              <img
                src={review.user.avatarUrl}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover border border-neutral-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-navy/10 text-brand-navy flex items-center justify-center font-bold text-body-sm shrink-0">
                {initial}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-brand-navy text-body-md">
                  {userName}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Đã mua hàng
                </span>
              </div>
              <div className="text-[12px] text-neutral-400 mt-0.5">{formattedDate}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StarRating value={review.rating} size="sm" readOnly />

            {/* Menu thao tác nếu là tác giả hoặc admin */}
            {(isAuthor || isAdmin) && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                  title="Tùy chọn"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <div
                    className="absolute right-0 top-8 z-20 w-44 bg-white rounded-xl shadow-lg border border-neutral-200 py-1.5 text-body-sm"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    {isAuthor && onEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onEdit(review);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center gap-2 text-neutral-700 cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4 text-neutral-500" />
                        Chỉnh sửa nhận xét
                      </button>
                    )}

                    {isAuthor && onDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete(review);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
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
                        className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 border-t border-neutral-100 cursor-pointer"
                      >
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        Xóa (Quyền Admin)
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Nội dung Comment */}
        {review.comment ? (
          <p className="text-body-md text-neutral-700 leading-relaxed whitespace-pre-line">
            {review.comment}
          </p>
        ) : (
          <p className="text-body-sm text-neutral-400 italic">
            Người mua không để lại nhận xét bằng chữ.
          </p>
        )}

        {/* Gallery ảnh khách hàng đính kèm */}
        {Array.isArray(review.images) && review.images.length > 0 && (
          <div className="flex items-center gap-2.5 pt-1 flex-wrap">
            {review.images.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(imgUrl)}
                className="w-20 h-20 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 hover:opacity-90 hover:scale-105 transition-all cursor-pointer relative group"
              >
                <img
                  src={imgUrl}
                  alt={`Review feedback ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* ─── PHẦN PHẢN HỒI (REPLIES LIST) ─────────────────────────────────── */}
        <div className="mt-2 pt-3 border-t border-neutral-100 flex flex-col gap-3">
          {/* Danh sách các câu trả lời */}
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
                    className={`rounded-xl p-3.5 flex flex-col gap-1.5 transition-colors border ${
                      isShop
                        ? 'bg-[#5D1C34]/[0.03] border-[#5D1C34]/15'
                        : 'bg-neutral-50 border-neutral-200/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isShop ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-navy text-white text-[10px] font-bold tracking-wide uppercase">
                            <Sparkles className="w-3 h-3 text-brand-gold" />
                            Phản hồi từ shop
                          </span>
                        ) : (
                          <span className="font-semibold text-brand-navy text-body-sm">
                            {rep.user?.name || 'Thành viên'}
                          </span>
                        )}
                        <span className="text-[11px] text-neutral-400">{repDate}</span>
                      </div>

                      {/* Nút sửa / xóa reply */}
                      {canManageReply && editingReplyId !== rep.id && (
                        <div className="flex items-center gap-1">
                          {rep.userId === currentUserId && (
                            <button
                              type="button"
                              onClick={() => handleStartEditReply(rep)}
                              className="p-1 text-neutral-400 hover:text-neutral-700 rounded transition-colors cursor-pointer"
                              title="Chỉnh sửa phản hồi"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteReply(rep.id)}
                            className="p-1 text-neutral-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                            title="Xóa phản hồi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Nội dung phản hồi hoặc Form chỉnh sửa inline */}
                    {editingReplyId === rep.id ? (
                      <div className="flex flex-col gap-2 mt-1">
                        <textarea
                          rows={2}
                          value={editReplyText}
                          onChange={(e) => setEditReplyText(e.target.value)}
                          maxLength={1000}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-body-sm text-neutral-800 focus:outline-none focus:border-brand-navy resize-none"
                        />
                        <div className="flex items-center justify-between text-[11px] text-neutral-400">
                          <span>{editReplyText.length}/1000 ký tự</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingReplyId(null)}
                              className="px-2.5 py-1 text-neutral-500 hover:text-neutral-800 cursor-pointer"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEditReply(rep.id)}
                              disabled={updateReplyMutation.isPending}
                              className="px-3 py-1 bg-brand-navy text-white font-medium rounded-md hover:bg-brand-navy/90 cursor-pointer disabled:opacity-50"
                            >
                              {updateReplyMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-body-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                        {rep.comment}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Nút bấm mở Form Trả lời */}
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
              className="self-start text-[12px] font-semibold text-brand-navy hover:text-[#5D1C34] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              Trả lời
            </button>
          ) : (
            /* Form nhập phản hồi Inline */
            <form onSubmit={handleSubmitReply} className="flex flex-col gap-2 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-neutral-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-brand-navy" />
                  {isAdmin ? 'Phản hồi với tư cách Shop / Quản trị viên' : 'Gửi câu trả lời của bạn'}
                </span>
                <span className="text-[11px] text-neutral-400">{replyText.length}/1000</span>
              </div>

              <textarea
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Viết phản hồi chi tiết về đánh giá này (tối đa 1000 ký tự)..."
                maxLength={1000}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-body-sm text-neutral-800 focus:outline-none focus:border-brand-navy resize-none bg-white"
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyText('');
                  }}
                  className="px-3 py-1.5 text-[12px] font-medium text-neutral-600 hover:text-neutral-800 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createReplyMutation.isPending || !replyText.trim() || replyText.length > 1000}
                  className="px-4 py-1.5 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-lg text-[12px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {createReplyMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                  Gửi phản hồi
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Lightbox xem ảnh feedback phóng to */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black/90 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedImage}
              alt="Review full"
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
