import type { Dispatch, JSX, SetStateAction } from 'react';
import type { SubscriptionHistoryItem, SubscriptionStatus } from '@/features/subscription/types/subscription';

export interface SubscriptionHistoryProps {
  isHistoryLoading: boolean;
  history: SubscriptionHistoryItem[];
  formatDate: (isoString?: string | null) => string;
  getStatusBadge: (subStatus: SubscriptionStatus) => JSX.Element;
  historyMeta: { total: number; page: number; limit: number; totalPages: number; } | undefined;
  setHistoryPage: Dispatch<SetStateAction<number>>;
  historyPage: number;
}
