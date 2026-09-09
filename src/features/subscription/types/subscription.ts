export type SubscriptionTier = 'FREE' | 'MEMBER' | 'VIP';

export type SubscriptionStatus = 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'CANCELLED';

export interface PlanQuota {
  action: 'TRY_ON' | 'STYLIST' | 'CHATBOT' | string;
  label: string;
  limit: number | null;
  unlimited: boolean;
}

export interface PlanItem {
  tier: SubscriptionTier;
  label: string;
  price: number;
  durationDays: number;
  quotas: PlanQuota[];
}

export interface SubscriptionDetail {
  id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  autoRenew: boolean;
  startsAt: string;
  expiresAt: string;
  daysRemaining: number;
  order?: {
    orderCode: number;
    amount: number;
    createdAt?: string;
  };
}

export interface MySubscriptionResponse {
  tier: SubscriptionTier;
  tierExpiresAt: string | null;
  isFree: boolean;
  current: SubscriptionDetail | null;
  scheduled: SubscriptionDetail | null;
}

export interface SubscriptionHistoryItem {
  id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  autoRenew: boolean;
  startsAt: string;
  expiresAt: string;
  createdAt: string;
  order?: {
    orderCode: number;
    amount: number;
    createdAt?: string;
  };
}

export interface SubscriptionHistoryResponse {
  items: SubscriptionHistoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
