'use client';

import { ImageFilePreviews } from '@/components/ui/image-file-previews';
import { OrderThumb } from '@/features/orders/components/order-ui';
import { useCreateOrderIssue } from '@/features/orders/hooks/useOrderIssues';
import { getOrderItemName } from '@/features/orders/services/order-display';
import type { OrderItem, OrderIssueReason } from '@/features/orders/types/orders';
import {
  AccountDialog,
  accountButtonClassName,
  accountFocusRing,
  accountInputClassName,
  accountLabelClassName,
} from '@/features/profile/components/account-ui';
import { describeImageFileRejection, useImageFileSelection } from '@/hooks/use-image-file-selection';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { ImagePlus, Loader2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderItem: OrderItem | null;
  onSuccess?: () => void;
  mode?: 'PRODUCT' | 'REFUND_NOT_RECEIVED';
  defaultBank?: {
    bankName?: string | null;
    accountNumber?: string | null;
    accountHolder?: string | null;
  };
}

const REASONS: { value: OrderIssueReason; label: string; desc: string }[] = [
  {
    value: 'WRONG_SIZE',
    label: 'Sai kích thước / số đo',
    desc: 'Sản phẩm may không khớp với thông số số đo đã đặt.',
  },
  {
    value: 'WRONG_COLOR',
    label: 'Sai màu sắc',
    desc: 'Màu sắc thực tế sai khác hoàn toàn so với mô tả đã chọn.',
  },
  {
    value: 'QUALITY_MISMATCH',
    label: 'Lỗi đường may / Chất lượng vải',
    desc: 'Sản phẩm bị lỗi vải, rách, đường chỉ lỗi hoặc kém chất lượng.',
  },
  {
    value: 'OTHER',
    label: 'Lý do khác',
    desc: 'Vấn đề phát sinh khác (sẽ được Admin xem xét thủ công).',
  },
];

const MAX_EVIDENCE_IMAGES = 10;

export function ReportIssueModal({
  isOpen,
  onClose,
  orderId,
  orderItem,
  onSuccess,
  mode = 'PRODUCT',
  defaultBank,
}: ReportIssueModalProps) {
  const isRefundMode = mode === 'REFUND_NOT_RECEIVED';
  const defaultBankName = defaultBank?.bankName ?? '';
  const defaultAccountNumber = defaultBank?.accountNumber ?? '';
  const defaultAccountHolder = defaultBank?.accountHolder ?? '';

  const [reason, setReason] = useState<OrderIssueReason>('WRONG_SIZE');
  const [description, setDescription] = useState('');
  const evidence = useImageFileSelection({
    maxFiles: MAX_EVIDENCE_IMAGES,
    onReject: (rejection) => toast.error(describeImageFileRejection(rejection, 'ảnh minh chứng')),
  });
  const clearEvidence = evidence.clear;
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createOrderIssueAsync, isPending } = useCreateOrderIssue();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setReason(isRefundMode ? 'REFUND_NOT_RECEIVED' : 'WRONG_SIZE');
      setDescription('');
      clearEvidence();
      setBankName(defaultBankName);
      setAccountNumber(defaultAccountNumber);
      setAccountHolder(defaultAccountHolder);
      setSubmitError(null);
    }
  }, [
    isOpen,
    isRefundMode,
    defaultBankName,
    defaultAccountNumber,
    defaultAccountHolder,
    clearEvidence,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderItem) return;
    setSubmitError(null);

    const trimmedDesc = description.trim();
    if (trimmedDesc.length < 10) {
      setSubmitError('Vui lòng nhập mô tả chi tiết ít nhất 10 ký tự.');
      return;
    }
    if (trimmedDesc.length > 2000) {
      setSubmitError('Mô tả không được vượt quá 2000 ký tự.');
      return;
    }

    const trimmedBankName = bankName.trim();
    const trimmedAccountNumber = accountNumber.trim();
    const trimmedAccountHolder = accountHolder.trim();
    if (!trimmedBankName) {
      setSubmitError('Vui lòng nhập tên ngân hàng nhận hoàn tiền.');
      return;
    }
    if (!/^[0-9]{6,20}$/.test(trimmedAccountNumber)) {
      setSubmitError('Số tài khoản phải gồm 6-20 chữ số.');
      return;
    }
    if (!trimmedAccountHolder) {
      setSubmitError('Vui lòng nhập tên chủ tài khoản.');
      return;
    }

    try {
      await createOrderIssueAsync({
        orderId,
        orderItemId: orderItem.id,
        reason,
        description: trimmedDesc,
        desiredResolution: 'REFUND',
        evidenceImages: evidence.files,
        bankName: trimmedBankName,
        accountNumber: trimmedAccountNumber,
        accountHolder: trimmedAccountHolder,
      });

      toast.success(
        isRefundMode
          ? 'Đã gửi báo cáo chưa nhận được tiền hoàn. Shop sẽ kiểm tra và phản hồi sớm nhất!'
          : 'Gửi yêu cầu báo lỗi sản phẩm thành công. Đội ngũ FashionAI sẽ xem xét sớm nhất!'
      );
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Không thể gửi yêu cầu báo lỗi lúc này.');
      setSubmitError(msg);
      toast.error(msg);
    }
  };

  const descriptionLength = description.trim().length;

  return (
    <AccountDialog
      open={isOpen && Boolean(orderItem)}
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
      eyebrow={isRefundMode ? 'Hoàn tiền' : 'Báo lỗi sản phẩm'}
      title={isRefundMode ? 'Chưa nhận được tiền hoàn' : 'Yêu cầu xử lý'}
      description={
        isRefundMode
          ? 'Dùng khi shop đã ghi nhận hoàn tiền trong 7 ngày qua mà bạn chưa nhận được.'
          : 'Áp dụng cho đơn đã hoàn tất trong vòng 7 ngày.'
      }
      className="sm:max-w-[600px]"
    >
      {orderItem ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
          <div className="flex items-center gap-3 border-b border-landing-line/70 pb-5">
            <OrderThumb item={orderItem} className="h-16 w-12" />
            <div className="min-w-0">
              <p className="product-name-line line-clamp-1 text-landing-obsidian">{getOrderItemName(orderItem)}</p>
              <p className="mt-0.5 text-xs text-landing-muted">
                Màu: {orderItem.color || 'Mặc định'} · SL <span className="font-mono">{orderItem.quantity}</span>
              </p>
            </div>
          </div>

          {submitError ? (
            <p role="alert" className="border-l-2 border-destructive bg-landing-ivory px-3 py-2 text-sm text-destructive">
              {submitError}
            </p>
          ) : null}

          {isRefundMode ? (
            <div className="border-l-2 border-landing-brass bg-landing-ivory px-3 py-2.5">
              <p className="text-sm font-medium text-landing-obsidian">Lý do: chưa nhận được tiền hoàn</p>
              <p className="mt-1 text-xs leading-relaxed text-landing-muted">
                Vui lòng kiểm tra sao kê ngân hàng trước khi gửi. Shop sẽ đối chiếu lại giao dịch và chuyển lại nếu tiền chưa
                tới tài khoản của bạn.
              </p>
            </div>
          ) : (
            <fieldset>
              <legend className={accountLabelClassName}>
                Lý do báo lỗi <span className="text-destructive">*</span>
              </legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {REASONS.map((option) => {
                  const selected = reason === option.value;
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        'flex cursor-pointer flex-col gap-1 rounded-[2px] border px-3 py-2.5 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-landing-oxblood',
                        selected ? 'border-landing-oxblood bg-landing-ivory' : 'border-landing-line bg-landing-ivory/50 hover:border-landing-brass',
                      )}
                    >
                      <input
                        type="radio"
                        name="issue-reason"
                        value={option.value}
                        checked={selected}
                        onChange={() => setReason(option.value)}
                        className="sr-only"
                      />
                      <span className="flex items-center justify-between gap-3">
                        <span className={cn('text-sm', selected ? 'font-medium text-landing-oxblood' : 'text-landing-obsidian')}>
                          {option.label}
                        </span>
                        <span
                          aria-hidden="true"
                          className={cn(
                            'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border',
                            selected ? 'border-landing-oxblood' : 'border-landing-taupe',
                          )}
                        >
                          {selected ? <span className="h-1.5 w-1.5 rounded-full bg-landing-oxblood" /> : null}
                        </span>
                      </span>
                      <span className="text-xs leading-relaxed text-landing-muted">{option.desc}</span>
                    </label>
                  );
                })}
              </div>
              {reason === 'OTHER' ? (
                <p className="mt-3 border-l-2 border-landing-brass pl-3 text-xs leading-relaxed text-landing-brass-ink">
                  Yêu cầu vì lý do khác cần bộ phận chăm sóc khách hàng thẩm định riêng và có thể không được chấp thuận.
                </p>
              ) : null}
            </fieldset>
          )}

          <div>
            <p className={accountLabelClassName}>Hướng xử lý</p>
            <p className="mt-2 text-sm font-medium text-landing-obsidian">Hoàn tiền</p>
            <p className="mt-0.5 text-xs leading-relaxed text-landing-muted">
              {isRefundMode
                ? 'Shop đối chiếu lại giao dịch và chuyển lại tiền vào tài khoản của bạn nếu chưa nhận được.'
                : 'Shop hoàn tiền về tài khoản ngân hàng của bạn sau khi nhận lại và kiểm tra hàng hoàn.'}
            </p>
          </div>

          <fieldset>
            <legend className={accountLabelClassName}>
              {isRefundMode ? 'Tài khoản nhận lại tiền hoàn' : 'Tài khoản nhận hoàn tiền'} <span className="text-destructive">*</span>
            </legend>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Ngân hàng (VD: Vietcombank)"
                aria-label="Tên ngân hàng"
                className={accountInputClassName}
              />
              <input
                type="text"
                inputMode="numeric"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\s/g, ''))}
                placeholder="Số tài khoản"
                aria-label="Số tài khoản"
                className={cn(accountInputClassName, 'font-mono')}
              />
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Tên chủ tài khoản (không dấu)"
                aria-label="Tên chủ tài khoản"
                className={cn(accountInputClassName, 'uppercase placeholder:normal-case sm:col-span-2')}
              />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-landing-muted">
              {isRefundMode
                ? 'Kiểm tra kỹ số tài khoản. Shop sẽ chuyển lại tiền vào đúng tài khoản này.'
                : 'Shop chuyển khoản hoàn tiền vào tài khoản này sau khi nhận và kiểm tra hàng hoàn.'}
            </p>
          </fieldset>

          <div>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="issue-description" className={accountLabelClassName}>
                Mô tả chi tiết <span className="text-destructive">*</span>
              </label>
              <span className={cn('font-mono text-[11px]', descriptionLength < 10 ? 'text-landing-brass-ink' : 'text-landing-muted')}>
                {description.length}/2000
              </span>
            </div>
            <textarea
              id="issue-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isRefundMode
                  ? 'Ví dụ: đã kiểm tra sao kê Vietcombank từ 01/11 đến 03/11 nhưng chưa thấy khoản hoàn nào.'
                  : 'Ví dụ: áo lệch vai trái khoảng 4cm so với số đo đã đặt, đường chỉ tay áo bị tuột.'
              }
              className={cn(accountInputClassName, 'mt-2 h-auto min-h-[104px] resize-y py-2.5 leading-relaxed')}
            />
            <p className="mt-1.5 text-xs text-landing-muted">Tối thiểu 10 ký tự.</p>
          </div>

          <div>
            <p className={accountLabelClassName}>
              {isRefundMode ? 'Ảnh sao kê / chứng từ' : 'Ảnh minh chứng'}{' '}
              <span className="font-normal normal-case tracking-normal text-landing-muted">
                (tối đa {MAX_EVIDENCE_IMAGES} ảnh, mỗi ảnh dưới 10MB)
              </span>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                setSubmitError(null);
                evidence.add(e.target.files);
                // Allow picking the same file again after removing it.
                e.target.value = '';
              }}
            />
            {evidence.items.length > 0 ? (
              <ImageFilePreviews
                items={evidence.items}
                onRemove={evidence.remove}
                onAdd={evidence.canAddMore ? () => fileInputRef.current?.click() : undefined}
                disabled={isPending}
                className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5"
                tileClassName="size-auto aspect-square"
              />
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                className={cn(
                  'mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-[2px] border border-dashed border-landing-taupe bg-landing-ivory/50 px-4 py-6 text-landing-muted transition-colors hover:border-landing-oxblood hover:text-landing-oxblood disabled:opacity-50',
                  accountFocusRing,
                )}
              >
                <ImagePlus className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                <span className="text-sm font-medium">
                  {isRefundMode ? 'Tải lên ảnh sao kê (nếu có)' : 'Tải lên ảnh chụp lỗi thực tế'}
                </span>
                <span className="text-xs">JPG, PNG hoặc WEBP</span>
              </button>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-landing-line/70 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={isPending} className={accountButtonClassName('outline')}>
              Hủy
            </button>
            <button type="submit" disabled={isPending || descriptionLength < 10} className={accountButtonClassName('primary')}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} /> : null}
              {isPending ? 'Đang gửi' : isRefundMode ? 'Gửi báo cáo' : 'Gửi yêu cầu'}
            </button>
          </div>
        </form>
      ) : null}
    </AccountDialog>
  );
}
