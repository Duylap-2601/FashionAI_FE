import { AuthClientError } from '@/features/auth/services/session';
import type { UserTier } from '@/features/auth/types/auth';

export function readErrorBody(error: unknown): { message?: string; details?: string[] } | undefined {
  if (!(error instanceof AuthClientError)) return undefined;
  const data = error.data;
  if (!data || typeof data !== 'object') return undefined;
  const record = data as Record<string, unknown>;
  return {
    message: typeof record.message === 'string' ? record.message : undefined,
    details: Array.isArray(record.details) && record.details.every((item) => typeof item === 'string')
      ? record.details
      : undefined,
  };
}

export function mapTier(tier: 'FREE' | 'MEMBER' | 'VIP'): UserTier {
  switch (tier) {
    case 'MEMBER':
      return 'member';
    case 'VIP':
      return 'vip';
    case 'FREE':
    default:
      return 'free';
  }
}
