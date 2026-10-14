'use client';

import { useAuthStore } from '@/features/auth/store/authStore';
import { toMergeLines } from '@/features/cart/services/cart-mapper';
import { createServerCartMutationOptions, decideCartSyncAction } from '@/features/cart/services/cart-sync';
import { mutationKeys } from '@/features/cart/services/mutation-keys';
import { mergeCart } from '@/features/cart/services/mutations';
import { useCartStore } from '@/features/cart/store/cartStore';
import type { MergeCartResponse } from '@/features/cart/types/cart-api';
import type { GuestCartMergeVariables } from '@/features/cart/types/cart-sync';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Đồng bộ giỏ theo trạng thái đăng nhập, bắt mọi đường đăng nhập (mật khẩu, Google,
 * mobile callback, khôi phục phiên) mà không phải sửa từng chỗ:
 * - Vừa đăng nhập: gộp giỏ khách lên server (món trùng lấy số lượng lớn hơn) rồi xoá
 *   các món đã gộp khỏi giỏ khách.
 * - Đăng xuất / hết phiên: xoá giỏ khách còn sót và đóng panel, người sau không thấy giỏ người trước.
 */
export function CartSync() {
  const queryClient = useQueryClient();
  const status = useAuthStore((state) => state.status);
  const userId = useAuthStore((state) => state.user?.id || null);
  const mergedForRef = useRef<string | null>(null);
  const prevStatusRef = useRef(status);

  // Chạy trong cùng scope với các mutation giỏ khác: thêm/sửa giỏ trong lúc gộp sẽ chờ gộp xong.
  const { mutate: mergeGuestCart } = useMutation(
    createServerCartMutationOptions<MergeCartResponse, GuestCartMergeVariables>(queryClient, {
      userId,
      mutationKey: mutationKeys.merge(),
      mutationFn: ({ lines }) => mergeCart({ items: lines }),
      retry: 2,
      errorMessage: 'Chưa gộp được giỏ hàng trên thiết bị này vào tài khoản, sẽ thử lại khi tải lại trang.',
      notifyError: (_error, message) => {
        // Giữ giỏ khách để lần sau thử gộp lại.
        mergedForRef.current = null;
        toast.error(message);
      },
      onSuccess: ({ skipped }, { guestIds, userId: mergedUserId }) => {
        // Đã đổi tài khoản / đăng xuất trong lúc gộp thì không đụng giỏ khách hiện tại.
        if (useAuthStore.getState().user?.id !== mergedUserId) return;
        const { removeFromCart } = useCartStore.getState();
        guestIds.forEach((id) => removeFromCart(id));
        if (skipped.length > 0) {
          toast.info(`${skipped.length} sản phẩm trong giỏ không còn đặt được nên đã được bỏ ra.`);
        }
      },
    }),
  );

  useEffect(() => {
    const action = decideCartSyncAction({
      prevStatus: prevStatusRef.current,
      status,
      userId,
      mergedFor: mergedForRef.current,
    });
    prevStatusRef.current = status;
    if (status === 'unauthenticated') mergedForRef.current = null;

    if (action === 'clear-guest') {
      useCartStore.getState().clearCart();
      useCartStore.getState().setIsCartOpen(false);
      return;
    }
    if (action !== 'merge' || !userId) return;
    mergedForRef.current = userId;

    const guestItems = useCartStore.getState().cartItems;
    if (guestItems.length === 0) return;
    const lines = toMergeLines(guestItems);
    if (lines.length === 0) {
      // Toàn món BE không nhận (sản phẩm mock): bỏ luôn.
      useCartStore.getState().clearCart();
      return;
    }
    mergeGuestCart({ lines, guestIds: guestItems.map((item) => item.id), userId });
  }, [status, userId, mergeGuestCart]);

  return null;
}
