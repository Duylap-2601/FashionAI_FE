import type { TargetTier } from '@/features/payments/types/payments';
import type { SubscriptionStatus } from '@/features/subscription/types/subscription';

export interface CurrentSubscriptionProps {
  tier: "FREE" | "MEMBER" | "VIP";
  current: import("@/features/subscription/types/subscription").SubscriptionDetail | null;
  getStatusBadge: (subStatus: SubscriptionStatus) => import("D:/workplace/projects/EXE/FashionAI_FE/node_modules/@types/react/index").JSX.Element;
  setActiveTab: import("D:/workplace/projects/EXE/FashionAI_FE/node_modules/@types/react/index").Dispatch<import("D:/workplace/projects/EXE/FashionAI_FE/node_modules/@types/react/index").SetStateAction<"plans" | "my-sub" | "history">>;
  handleInitiateUpgrade: (targetTier: TargetTier) => void;
  formatDate: (isoString?: string | null) => string;
  rawExpiresAt: string | null | undefined;
  expirationInfo: { formattedDate: string; daysRemaining: number; isExpired: boolean; isExpiringSoon: boolean; } | null;
  scheduled: import("@/features/subscription/types/subscription").SubscriptionDetail | null;
  handleToggleAutoRenew: () => Promise<void>;
  isCancelling: boolean;
  isResuming: boolean;
}
