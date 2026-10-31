'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Check, DollarSign, Loader2, Percent, Tag, X } from 'lucide-react';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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

const fieldClass =
  'w-full rounded-[2px] border border-landing-line bg-landing-ivory px-3 py-2 text-[13px] text-landing-obsidian outline-none transition-colors placeholder:text-landing-muted focus:border-landing-oxblood focus:ring-2 focus:ring-landing-oxblood/15';
const labelTextClass = 'text-[11px] font-semibold uppercase tracking-[0.1em] text-landing-muted';

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Trợ giúp"
          className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-landing-taupe text-[9px] font-bold leading-none text-landing-muted transition-colors hover:border-landing-oxblood hover:text-landing-oxblood"
        >
          ?
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-60 border-landing-line bg-landing-ivory p-3 text-[12px] leading-relaxed text-landing-obsidian"
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}

function FieldLabel({ htmlFor, text, required, hint }: { htmlFor: string; text: string; required?: boolean; hint?: React.ReactNode }) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5">
      <label htmlFor={htmlFor} className={labelTextClass}>
        {text}
        {required && <span className="text-destructive"> *</span>}
      </label>
      {hint && <FieldHint>{hint}</FieldHint>}
    </div>
  );
}

function toLocalDatetimeString(isoString?: string | null): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
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

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, submitting, onClose]);

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

    if (startsAt && expiresAt && new Date(startsAt) >= new Date(expiresAt)) {
      setErrorMsg('Thời gian hết hạn phải sau thời gian bắt đầu.');
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
        className="fixed inset-0 bg-landing-obsidian/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="coupon-modal-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-[2px] bg-landing-ivory"
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="flex items-center justify-between gap-4 border-b border-landing-line px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] bg-landing-oxblood/10 text-landing-oxblood">
              <Tag className="h-4 w-4" />
            </span>
            <h2 id="coupon-modal-title" className="truncate font-display text-[1.15rem] leading-tight text-landing-obsidian">
              {isEditing ? `Chỉnh sửa mã ${coupon?.code}` : 'Tạo mã giảm giá mới'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-landing-muted transition-colors hover:bg-landing-paper hover:text-landing-obsidian"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {errorMsg && (
              <div className="flex items-start gap-2 rounded-[2px] border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div>
                <FieldLabel
                  htmlFor="coupon-code"
                  text="Mã"
                  required
                  hint="Chỉ gồm chữ in hoa, số và dấu _ -."
                />
                <input
                  id="coupon-code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                  placeholder="VD: SALE20"
                  className={`${fieldClass} font-mono font-bold uppercase tracking-wider`}
                />
              </div>

              <div>
                <span className={`mb-1.5 block ${labelTextClass}`}>Trạng thái</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  onClick={() => setIsActive((v) => !v)}
                  className={`flex h-[38px] min-w-[110px] items-center justify-center gap-2 rounded-[2px] border px-3 text-[12px] font-semibold transition-colors ${
                    isActive
                      ? 'border-metric-products bg-metric-products/10 text-metric-products'
                      : 'border-landing-line bg-landing-paper/60 text-landing-muted'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-metric-products' : 'bg-landing-taupe'}`} />
                  {isActive ? 'Bật' : 'Tắt'}
                </button>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-1.5">
                <span className={labelTextClass}>Loại giảm</span>
                <FieldHint>Phần trăm tính trên tạm tính sau sale; số tiền trừ trực tiếp vào đơn.</FieldHint>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDiscountType('PERCENTAGE')}
                  className={`flex items-center gap-2 rounded-[2px] border px-3 py-2.5 text-left text-[13px] font-semibold transition-colors ${
                    discountType === 'PERCENTAGE'
                      ? 'border-landing-oxblood bg-landing-oxblood/5 text-landing-oxblood'
                      : 'border-landing-line bg-landing-ivory text-landing-obsidian hover:bg-landing-paper/60'
                  }`}
                >
                  <Percent className="h-4 w-4 shrink-0" />
                  <span className="flex-1">Theo %</span>
                  {discountType === 'PERCENTAGE' && <Check className="h-4 w-4 shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => setDiscountType('FIXED_AMOUNT')}
                  className={`flex items-center gap-2 rounded-[2px] border px-3 py-2.5 text-left text-[13px] font-semibold transition-colors ${
                    discountType === 'FIXED_AMOUNT'
                      ? 'border-landing-oxblood bg-landing-oxblood/5 text-landing-oxblood'
                      : 'border-landing-line bg-landing-ivory text-landing-obsidian hover:bg-landing-paper/60'
                  }`}
                >
                  <DollarSign className="h-4 w-4 shrink-0" />
                  <span className="flex-1">Số tiền</span>
                  {discountType === 'FIXED_AMOUNT' && <Check className="h-4 w-4 shrink-0" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel
                  htmlFor="coupon-value"
                  text={discountType === 'PERCENTAGE' ? 'Giảm (%)' : 'Giảm (VNĐ)'}
                  required
                  hint={discountType === 'PERCENTAGE' ? 'Tỷ lệ giảm, từ 1 đến 100%.' : 'Số tiền trừ trực tiếp vào đơn.'}
                />
                <input
                  id="coupon-value"
                  type="number"
                  required
                  min="1"
                  max={discountType === 'PERCENTAGE' ? 100 : undefined}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'PERCENTAGE' ? 'VD: 20' : 'VD: 50000'}
                  className={fieldClass}
                />
                {discountType === 'FIXED_AMOUNT' && discountValue && !isNaN(Number(discountValue)) && (
                  <p className="mt-1 text-[11px] text-landing-muted">{fmt(Number(discountValue))}</p>
                )}
              </div>

              {discountType === 'PERCENTAGE' && (
                <div>
                  <FieldLabel
                    htmlFor="coupon-max"
                    text="Tối đa"
                    hint="Mức giảm tối đa cho mã phần trăm. Bỏ trống = không giới hạn."
                  />
                  <input
                    id="coupon-max"
                    type="number"
                    min="0"
                    value={maxDiscountVnd}
                    onChange={(e) => setMaxDiscountVnd(e.target.value)}
                    placeholder="Không giới hạn"
                    className={fieldClass}
                  />
                  {maxDiscountVnd && !isNaN(Number(maxDiscountVnd)) && (
                    <p className="mt-1 text-[11px] text-landing-muted">{fmt(Number(maxDiscountVnd))}</p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <FieldLabel
                  htmlFor="coupon-min-order"
                  text="Đơn tối thiểu"
                  hint="Giá trị đơn tối thiểu để dùng mã. Bỏ trống = không yêu cầu."
                />
                <input
                  id="coupon-min-order"
                  type="number"
                  min="0"
                  value={minOrderVnd}
                  onChange={(e) => setMinOrderVnd(e.target.value)}
                  placeholder="Không yêu cầu"
                  className={fieldClass}
                />
              </div>
              <div>
                <FieldLabel
                  htmlFor="coupon-usage-limit"
                  text="Tổng lượt"
                  hint="Tổng số lượt mã được dùng. Bỏ trống = không giới hạn."
                />
                <input
                  id="coupon-usage-limit"
                  type="number"
                  min="1"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="Không giới hạn"
                  className={fieldClass}
                />
              </div>
              <div>
                <FieldLabel
                  htmlFor="coupon-usage-user"
                  text="Lượt/khách"
                  hint="Số lượt tối đa mỗi khách. Bỏ trống = không giới hạn."
                />
                <input
                  id="coupon-usage-user"
                  type="number"
                  min="1"
                  value={usageLimitPerUser}
                  onChange={(e) => setUsageLimitPerUser(e.target.value)}
                  placeholder="Không giới hạn"
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="coupon-starts" text="Bắt đầu" />
                <input
                  id="coupon-starts"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className={`${fieldClass} text-xs`}
                />
              </div>
              <div>
                <FieldLabel
                  htmlFor="coupon-expires"
                  text="Hết hạn"
                  hint="Bỏ trống để mã không giới hạn thời gian."
                />
                <input
                  id="coupon-expires"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className={`${fieldClass} text-xs`}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-landing-line px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-[2px] px-4 py-2 text-[13px] font-medium text-landing-obsidian transition-colors hover:bg-landing-paper disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-[2px] bg-landing-oxblood px-5 py-2 text-[13px] font-bold text-landing-paper transition-colors hover:bg-landing-oxblood/90 disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isEditing ? 'Lưu thay đổi' : 'Tạo mã giảm giá'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
