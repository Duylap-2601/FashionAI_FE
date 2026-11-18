import type { AiActionName, UserQuota } from '@/features/subscription/types/quota';

export interface QuotaGateInput {
  quota: UserQuota | undefined;
  isLoading: boolean;
  isError: boolean;
}

export type QuotaGate =
  | { state: 'loading' }
  | { state: 'unavailable' }
  | { state: 'blocked' }
  | { state: 'allowed'; remaining: number };

/**
 * Quyết định có được gửi request analyze hay không dựa trên quota đã tải.
 * Không đoán quota khi API lỗi/chưa tải: chặn gửi thay vì để BE trả 429 (BR-152).
 */
export function resolveQuotaGate({ quota, isLoading, isError }: QuotaGateInput): QuotaGate {
  if (isError || (!isLoading && !quota)) return { state: 'unavailable' };
  if (!quota) return { state: 'loading' };

  const remaining =
    quota.unlimited || quota.limit === null
      ? Infinity
      : (quota.limit ?? 0) - quota.used;
  if (remaining > 0) return { state: 'allowed', remaining };
  return { state: 'blocked' };
}

export interface QuotaModalState {
  resetAt: string | null;
  requested?: number;
  remaining?: number;
}

export const EMPTY_QUOTA_MODAL: QuotaModalState = { resetAt: null };

export interface QuotaErrorDetails {
  resetAt: string | null;
  requested?: number;
  remaining?: number;
}

/** Đọc `details` BE trả trong lỗi 429/402 để modal hiện đúng số lượt (BUG-045). */
export function parseQuotaErrorDetails(error: unknown): QuotaModalState {
  const data =
    typeof error === 'object' && error !== null && 'response' in error
      ? ((error as { response?: { data?: unknown } }).response?.data as Record<string, unknown> | undefined)
      : undefined;
  const details =
    data && typeof data.details === 'object' && data.details !== null
      ? (data.details as Record<string, unknown>)
      : {};
  const toNumber = (value: unknown) =>
    typeof value === 'number' && Number.isFinite(value) ? value : undefined;
  return {
    resetAt: typeof details.resetAt === 'string' ? details.resetAt : null,
    requested: toNumber(details.requested),
    remaining: toNumber(details.remaining),
  };
}

/** `?result=<id>` giữ kết quả đang xem khi reload/chia sẻ link; sản phẩm neo đi kèm qua `?productId=` (BR-153). */
export function parseStylistDeepLink(search: string): { resultId: string | null; productId: string | null } {
  const params = new URLSearchParams(search);
  return {
    resultId: params.get('result') || null,
    productId: params.get('productId') || null,
  };
}

/** URL mới sau khi chọn/xoá kết quả; luôn giữ `productId` nếu còn. */
export function buildStylistDeepLink(id: string | null, productId?: string | null): string {
  const params = new URLSearchParams();
  if (id) params.set('result', id);
  if (productId) params.set('productId', productId);
  const query = params.toString();
  return query ? `/ai-stylist?${query}` : '/ai-stylist';
}

export const STYLIST_ACTION: AiActionName = 'STYLIST';
