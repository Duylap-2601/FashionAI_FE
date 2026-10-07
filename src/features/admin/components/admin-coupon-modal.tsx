'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Loader2, Tag, Percent, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { fmt } from '@/features/admin/services/format';
import { createAdminCoupon, updateAdminCoupon } from '@/features/admin/services/mutations';
import type { AdminCoupon, CreateCouponPayload, UpdateCouponPayload, CouponDiscountType } from '@/features/admin/types/admin-coupons';
import { getErrorMessage } from '@/lib/errors';

interface AdminCouponModalProps {
  isOpen: boolean;
  coupon: AdminCoupon | null;
  onClose: () => void;
  onSuccess: () => void;
}

function toLocalDatetimeString(isoString?: string | null): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    // Format to YYYY-MM-DDTHH:mm
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
}

export function AdminCouponModal({ isOpen, coupon, onClose, onSuccess }: AdminCouponModalProps) {
  const isEditing = Boolean(coupon);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<CouponDiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<string>('');
  const [maxDiscountVnd, setMaxDiscountVnd] = useState<string>('');
  const [minOrderVnd, setMinOrderVnd] = useState<string>('');
  const [usageLimit, setUsageLimit] = useState<string>('');
  const [usageLimitPerUser, setUsageLimitPerUser] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [startsAt, setStartsAt] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code);
      setDiscountType(coupon.discountType);
      setDiscountValue(String(coupon.discountValue ?? ''));
      setMaxDiscountVnd(coupon.maxDiscountVnd ? String(coupon.maxDiscountVnd) : '');
      setMinOrderVnd(coupon.minOrderVnd ? String(coupon.minOrderVnd) : '');
      setUsageLimit(coupon.usageLimit !== null && coupon.usageLimit !== undefined ? String(coupon.usageLimit) : '');
      setUsageLimitPerUser(coupon.usageLimitPerUser !== null && coupon.usageLimitPerUser !== undefined ? String(coupon.usageLimitPerUser) : '');
      setIsActive(coupon.isActive);
      setStartsAt(toLocalDatetimeString(coupon.startsAt));
      setExpiresAt(toLocalDatetimeString(coupon.expiresAt));
    } else {
      setCode('');
      setDiscountType('PERCENTAGE');
      setDiscountValue('');
      setMaxDiscountVnd('');
      setMinOrderVnd('');
      setUsageLimit('');
      setUsageLimitPerUser('');
      setIsActive(true);
      setStartsAt('');
      setExpiresAt('');
    }
    setErrorMsg(null);
  }, [coupon, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Vui lòng nhập mã giảm giá.');
      return;
    }

    const numDiscountValue = Number(discountValue);
    if (isNaN(numDiscountValue) || numDiscountValue <= 0) {
      setErrorMsg('Giá trị giảm giá phải lớn hơn 0.');
      return;
    }

    if (discountType === 'PERCENTAGE' && numDiscountValue > 100) {
      setErrorMsg('Tỷ lệ giảm giá phần trăm không được vượt quá 100%.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateCouponPayload | UpdateCouponPayload = {
        code: cleanCode,
        discountType,
        discountValue: numDiscountValue,
        maxDiscountVnd: discountType === 'PERCENTAGE' && maxDiscountVnd.trim() ? Number(maxDiscountVnd) : null,
        minOrderVnd: minOrderVnd.trim() ? Number(minOrderVnd) : null,
        usageLimit: usageLimit.trim() ? Number(usageLimit) : null,
        usageLimitPerUser: usageLimitPerUser.trim() ? Number(usageLimitPerUser) : null,
        isActive,
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      if (isEditing && coupon) {
        await updateAdminCoupon(coupon.id, payload);
        toast.success(`Đã cập nhật mã giảm giá ${cleanCode}`);
      } else {
        await createAdminCoupon(payload as CreateCouponPayload);
        toast.success(`Đã tạo mã giảm giá ${cleanCode} thành công`);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Không thể lưu mã giảm giá.');
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col z-10 overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center text-brand-navy">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-body-lg font-bold text-neutral-900">
                {isEditing ? `Chỉnh sửa mã: ${coupon?.code}` : 'Tạo mã giảm giá mới'}
              </h2>
              <p className="text-label-sm text-neutral-500">
                {isEditing ? 'Cập nhật điều kiện và mức giảm' : 'Thiết lập mã coupon và giới hạn sử dụng'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors border-0 bg-transparent cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Code & Active status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-body-sm font-semibold text-neutral-700">
                Mã giảm giá <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                placeholder="VD: SALE20, WELCOME"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 font-mono font-bold tracking-wider uppercase text-neutral-900 focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
              />
              <span className="text-[11px] text-neutral-400">Chỉ gồm chữ in hoa, số và dấu gạch _ -</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-body-sm font-semibold text-neutral-700 block">
                Trạng thái
              </label>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsActive((v) => !v)}
                  className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                  {isActive ? 'Kích hoạt' : 'Đã tắt'}
                </button>
              </div>
            </div>
          </div>

          {/* Discount Type */}
          <div className="space-y-2">
            <label className="text-body-sm font-semibold text-neutral-700">Loại giảm giá</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDiscountType('PERCENTAGE')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  discountType === 'PERCENTAGE'
                    ? 'border-brand-navy bg-brand-navy/5 text-brand-navy font-bold ring-1 ring-brand-navy'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <Percent className="w-4 h-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold">Theo phần trăm (%)</p>
                  <p className="text-[10px] text-neutral-400">Giảm % trên tổng giá trị đơn</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDiscountType('FIXED_AMOUNT')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  discountType === 'FIXED_AMOUNT'
                    ? 'border-brand-navy bg-brand-navy/5 text-brand-navy font-bold ring-1 ring-brand-navy'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <DollarSign className="w-4 h-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold">Số tiền cố định (VNĐ)</p>
                  <p className="text-[10px] text-neutral-400">Trừ thẳng số tiền vào đơn</p>
                </div>
              </button>
            </div>
          </div>

          {/* Discount Value & Max Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-body-sm font-semibold text-neutral-700">
                {discountType === 'PERCENTAGE' ? 'Tỷ lệ giảm (%)' : 'Số tiền giảm (VNĐ)'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                max={discountType === 'PERCENTAGE' ? 100 : undefined}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'PERCENTAGE' ? 'VD: 20' : 'VD: 50000'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-neutral-900 focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
              />
              {discountType === 'FIXED_AMOUNT' && discountValue && !isNaN(Number(discountValue)) && (
                <span className="text-[11px] text-neutral-500 font-medium">{fmt(Number(discountValue))}</span>
              )}
            </div>

            {discountType === 'PERCENTAGE' && (
              <div className="space-y-1.5">
                <label className="text-body-sm font-semibold text-neutral-700">
                  Mức giảm tối đa (VNĐ) <span className="text-neutral-400 font-normal">(tùy chọn)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={maxDiscountVnd}
                  onChange={(e) => setMaxDiscountVnd(e.target.value)}
                  placeholder="Không giới hạn"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-neutral-900 focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
                />
                {maxDiscountVnd && !isNaN(Number(maxDiscountVnd)) && (
                  <span className="text-[11px] text-neutral-500 font-medium">Tối đa: {fmt(Number(maxDiscountVnd))}</span>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-body-sm font-semibold text-neutral-700">
                Giá trị đơn tối thiểu (VNĐ) <span className="text-neutral-400 font-normal">(tùy chọn)</span>
              </label>
              <input
                type="number"
                min="0"
                value={minOrderVnd}
                onChange={(e) => setMinOrderVnd(e.target.value)}
                placeholder="Không yêu cầu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-neutral-900 focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
              />
              {minOrderVnd && !isNaN(Number(minOrderVnd)) && (
                <span className="text-[11px] text-neutral-500 font-medium">Đơn từ: {fmt(Number(minOrderVnd))}</span>
              )}
            </div>
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-body-sm font-semibold text-neutral-700">
                Tổng lượt sử dụng tối đa <span className="text-neutral-400 font-normal">(tùy chọn)</span>
              </label>
              <input
                type="number"
                min="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Không giới hạn"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-neutral-900 focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-body-sm font-semibold text-neutral-700">
                Lượt dùng / Mỗi khách hàng <span className="text-neutral-400 font-normal">(tùy chọn)</span>
              </label>
              <input
                type="number"
                min="1"
                value={usageLimitPerUser}
                onChange={(e) => setUsageLimitPerUser(e.target.value)}
                placeholder="Không giới hạn"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-neutral-900 focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
              />
            </div>
          </div>

          {/* Validity dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-body-sm font-semibold text-neutral-700">
                Thời gian bắt đầu <span className="text-neutral-400 font-normal">(tùy chọn)</span>
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-neutral-900 focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-body-sm font-semibold text-neutral-700">
                Thời gian hết hạn <span className="text-neutral-400 font-normal">(tùy chọn)</span>
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-neutral-900 focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy text-xs"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-body-sm font-medium transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-brand-navy text-white text-body-sm font-bold hover:bg-brand-navy/90 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? 'Lưu thay đổi' : 'Tạo mã giảm giá'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
