import type { Order } from '@/features/orders/types/orders';

export interface AdminRefundPanelProps {
  order: Order;
  /** Status change is running (disables "Đã nhận hàng hoàn"). */
  updatingStatus: boolean;
  /** Moves the order to RETURNED after the returned goods were checked. */
  onReturnReceived: () => void;
  /** Reloads the order after the refund was recorded. */
  onRefundRecorded: () => Promise<unknown>;
}
