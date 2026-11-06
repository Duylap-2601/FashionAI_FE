'use client';

import type { ConfirmDeliveryDialogProps } from '@/features/orders/types/confirm-delivery-dialog';
import { AccountConfirmDialog } from '@/features/profile/components/account-ui';

/** Hỏi lại trước khi khách xác nhận đã nhận hàng: đơn sẽ hoàn tất và không hoàn tác được. */
export function ConfirmDeliveryDialog({ open, onOpenChange, orderCode, isPending, onConfirm }: ConfirmDeliveryDialogProps) {
  return (
    <AccountConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Bạn đã nhận được hàng?"
      description={
        <>
          Xác nhận đơn <span className="font-mono">{orderCode}</span> đã đến tay bạn. Đơn sẽ chuyển sang Hoàn tất và không
          hoàn tác được; nếu sản phẩm có vấn đề, bạn có 7 ngày để báo lỗi. Nếu chưa nhận được hàng, đóng hộp thoại và chọn
          “Tôi chưa nhận được hàng”.
        </>
      }
      confirmLabel="Đã nhận hàng"
      cancelLabel="Để sau"
      tone="primary"
      isPending={isPending}
      onConfirm={onConfirm}
    />
  );
}
