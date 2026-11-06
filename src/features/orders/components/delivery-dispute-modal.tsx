'use client';

import { ImageFilePreviews } from '@/components/ui/image-file-previews';
import { useCreateDeliveryDispute } from '@/features/orders/hooks/useOrders';
import {
  AccountDialog,
  accountButtonClassName,
  accountLabelClassName,
} from '@/features/profile/components/account-ui';
import { describeImageFileRejection, useImageFileSelection } from '@/hooks/use-image-file-selection';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/errors';
import { ImagePlus } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const MAX_EVIDENCE_IMAGES = 5;

export function DeliveryDisputeModal({
  open,
  onOpenChange,
  orderId,
  orderCode,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderCode: string;
  onSuccess?: () => void;
}) {
  const [description, setDescription] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const evidence = useImageFileSelection({
    maxFiles: MAX_EVIDENCE_IMAGES,
    onReject: (rejection) => toast.error(describeImageFileRejection(rejection, 'ảnh minh chứng')),
  });
  const clearEvidence = evidence.clear;
  const { createDeliveryDispute, isCreatingDeliveryDispute } = useCreateDeliveryDispute();

  useEffect(() => {
    if (open) {
      setDescription('');
      setSubmitError(null);
      clearEvidence();
    }
  }, [open, clearEvidence]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = description.trim();
    if (trimmed.length < 10) {
      setSubmitError('Vui lòng mô tả ít nhất 10 ký tự để shop kiểm tra với đơn vị vận chuyển.');
      return;
    }
    setSubmitError(null);
    createDeliveryDispute(
      { orderId, description: trimmed, images: evidence.files },
      {
        onSuccess: () => {
          toast.success('Đã báo chưa nhận được hàng. Shop sẽ kiểm tra và phản hồi.');
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error) => {
          setSubmitError(getErrorMessage(error, 'Không gửi được báo cáo lúc này.'));
        },
      },
    );
  };

  return (
    <AccountDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isCreatingDeliveryDispute) onOpenChange(false);
      }}
      eyebrow="Chưa nhận được hàng"
      title={`Đơn ${orderCode}`}
      description="Dùng khi hãng vận chuyển báo đã giao nhưng bạn chưa nhận được kiện hàng. Shop sẽ kiểm tra với đơn vị vận chuyển."
      className="sm:max-w-[560px]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <div>
          <label htmlFor="delivery-dispute-description" className={accountLabelClassName}>
            Mô tả tình trạng <span className="text-destructive">*</span>
          </label>
          <textarea
            id="delivery-dispute-description"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ví dụ: hãng báo giao lúc 15h nhưng mình không có nhà, không thấy kiện hàng trước cửa…"
            className="mt-1.5 w-full rounded-[2px] border border-landing-line bg-landing-ivory px-3 py-2.5 text-sm text-landing-obsidian focus:border-landing-oxblood focus:outline-none"
            maxLength={2000}
          />
          <p className="mt-1 text-right font-mono text-[10px] text-landing-muted">{description.trim().length}/2000</p>
        </div>

        <div>
          <p className={accountLabelClassName}>Ảnh minh chứng (tuỳ chọn)</p>
          <p className="mt-1 text-xs text-landing-muted">
            Ảnh trước cửa, biên nhận hoặc tin nhắn với shipper giúp shop đối chiếu nhanh hơn.
          </p>
          <ImageFilePreviews
            items={evidence.items}
            onRemove={evidence.remove}
            onAdd={evidence.canAddMore ? () => fileInputRef.current?.click() : undefined}
            disabled={isCreatingDeliveryDispute}
            className="mt-2"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(event) => {
              evidence.add(event.target.files);
              event.target.value = '';
            }}
          />
          {evidence.items.length === 0 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isCreatingDeliveryDispute}
              className="mt-2 inline-flex h-9 items-center gap-2 rounded-[2px] border border-landing-line px-3 text-xs font-medium text-landing-obsidian transition-colors hover:border-landing-oxblood/40"
            >
              <ImagePlus className="h-3.5 w-3.5" strokeWidth={1.75} />
              Thêm ảnh
            </button>
          ) : null}
        </div>

        {submitError ? (
          <p role="alert" className="border-l-2 border-destructive bg-landing-ivory px-3 py-2 text-sm text-destructive">
            {submitError}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-landing-line/70 pt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isCreatingDeliveryDispute}
            className={accountButtonClassName('quiet')}
          >
            Để sau
          </button>
          <button
            type="submit"
            disabled={isCreatingDeliveryDispute}
            className={cn(accountButtonClassName('primary'), 'min-w-[140px]')}
          >
            {isCreatingDeliveryDispute ? 'Đang gửi' : 'Gửi báo cáo'}
          </button>
        </div>
      </form>
    </AccountDialog>
  );
}
