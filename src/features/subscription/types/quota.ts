export type AiActionName = 'TRY_ON' | 'STYLIST' | 'CHATBOT';

export interface UserQuota {
  action?: AiActionName;
  used: number;
  limit: number | null;
  remaining?: number | null;
  requested?: number;
  unlimited?: boolean;
  tier: 'FREE' | 'MEMBER' | 'VIP' | 'free' | 'member' | 'vip' | 'admin';
  resetAt?: string;
  resetsAt?: string;
  limits?: Record<
    AiActionName,
    { label: string; limit: number | null; unlimited?: boolean }
  >;
}
