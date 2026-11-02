import type { OrderRefund } from '@/features/orders/types/orders';
import type { ReactNode } from 'react';

export type RefundFinalizeOutcome = 'COMPLETED' | 'FAILED';

export interface AdminRefundHistoryProps {
  refunds: OrderRefund[];
  /** Settles a refund stuck in PROCESSING (MoMo). Resolve `false` to keep the form open. */
  onFinalize?: (refundId: string, outcome: RefundFinalizeOutcome, note?: string) => Promise<boolean | void>;
  /** Extra rows under the list, e.g. refund evidence. */
  children?: ReactNode;
}
