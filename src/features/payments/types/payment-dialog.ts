import type { CheckoutResponse } from '@/features/payments/types/payments';

export interface PaymentDialogProps {
  checkoutResult: CheckoutResponse;
  // Số tiền BE đã chốt cho đơn.
  total: number;
  // Link xem đơn trong dialog; bỏ trống khi đang ở chính trang đơn.
  orderHref?: string | null;
  onClose: () => void;
  onPaid?: () => void;
}
