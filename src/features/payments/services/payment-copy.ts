import { DEFAULT_PLANS } from '@/features/subscription/constants/subscription-page';

/**
 * Một lần thanh toán là mua gói thành viên khi URL trả về của cổng có `kind=subscription`
 * (backend luôn gắn cho đơn nâng cấp gói) hoặc khi đơn/thanh toán mang `targetTier`.
 */
export function isSubscriptionPurchase(source: { kind?: string | null; targetTier?: string | null }): boolean {
  return source.kind === 'subscription' || source.targetTier != null;
}

/** Tên gói để hiển thị ("Hội Viên (Member)" / "Khách Hàng VIP"); null khi chưa biết. */
export function getSubscriptionPlanName(targetTier?: string | null): string | null {
  if (!targetTier) return null;
  return DEFAULT_PLANS.find((plan) => plan.id === targetTier)?.name ?? null;
}

/** Câu xác nhận gói đã kích hoạt, dùng chung cho /payment/success và /payment/result. */
export function getSubscriptionActivatedMessage(targetTier?: string | null): string {
  const planName = getSubscriptionPlanName(targetTier);
  return `${planName ? `Gói ${planName} của bạn` : 'Gói thành viên của bạn'} đã được kích hoạt. Lượt dùng trong ngày đã cập nhật theo gói mới.`;
}
