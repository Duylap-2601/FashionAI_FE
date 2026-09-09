import type { TargetTier } from '@/features/payments/types/payments';

export interface SubscriptionPlansProps {
  status: import("@/features/auth/types/auth-store").AuthStatus;
  tier: "FREE" | "MEMBER" | "VIP";
  expirationInfo: { formattedDate: string; daysRemaining: number; isExpired: boolean; isExpiringSoon: boolean; } | null;
  scheduled: import("@/features/subscription/types/subscription").SubscriptionDetail | null;
  handleInitiateUpgrade: (targetTier: TargetTier) => void;
  isCheckoutLoading: boolean;
}
