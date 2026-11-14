import { queryKeys as ordersQueryKeys } from '@/features/orders/services/query-keys';
import { queryKeys as paymentsQueryKeys } from '@/features/payments/services/query-keys';
import { queryKeys as profileQueryKeys } from '@/features/profile/services/query-keys';
import { queryKeys as subscriptionQueryKeys } from '@/features/subscription/services/query-keys';
import type { QueryClient } from '@tanstack/react-query';

// `/users/me` (hồ sơ + tier) chưa có factory riêng; giữ đúng tiền tố cache đang dùng.
const USERS_ME_KEY = ['users-me'] as const;

/**
 * Sau khi cổng báo đã thu tiền: gói thành viên, hạn dùng, hạn mức AI và danh sách đơn đều
 * đổi ở backend nhưng cache vẫn còn `staleTime` 60s, nên phải xoá để trang gói / đơn hiển
 * thị trạng thái mới ngay. Không gọi HTTP — chỉ đánh dấu cache cũ.
 */
export function invalidateAfterPayment(queryClient: QueryClient): Promise<void> {
  const keys = [
    subscriptionQueryKeys.subscriptionMe(),
    subscriptionQueryKeys.subscriptionHistory(),
    // ['quota'] khớp mọi hành động: TRY_ON, STYLIST, CHATBOT, LIVE_TRY_ON...
    subscriptionQueryKeys.quota(),
    USERS_ME_KEY,
    profileQueryKeys.profile(),
    // Danh sách đơn (trang hồ sơ, infinite, unpaid) — ['order', id] do nơi gọi tự xoá.
    ordersQueryKeys.orders(),
    paymentsQueryKeys.paymentOrders(),
  ];

  return Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey }))).then(() => undefined);
}
