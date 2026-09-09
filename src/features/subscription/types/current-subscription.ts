import type { Dispatch, JSX, SetStateAction } from 'react';
import type { TargetTier } from '@/features/payments/types/payments';
import type { SubscriptionDetail, SubscriptionStatus } from '@/features/subscription/types/subscription';

export interface CurrentSubscriptionProps {
  tier: "FREE" | "MEMBER" | "VIP";
  current: SubscriptionDetail | null;
  getStatusBadge: (subStatus: SubscriptionStatus) => JSX.Element;
  setActiveTab: Dispatch<SetStateAction<"plans" | "my-sub" | "history">>;
  handleInitiateUpgrade: (targetTier: TargetTier) => void;
  formatDate: (isoString?: string | null) => string;
  rawExpiresAt: string | null | undefined;
  expirationInfo: { formattedDate: string; daysRemaining: number; isExpired: boolean; isExpiringSoon: boolean; } | null;
  scheduled: SubscriptionDetail | null;
  handleToggleAutoRenew: () => Promise<void>;
  isCancelling: boolean;
  isResuming: boolean;
}
