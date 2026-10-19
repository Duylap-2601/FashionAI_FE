'use client';

import { cartItemToGaItem } from '@/features/analytics/services/ga-items';
import { useAuthStore } from '@/features/auth/store/authStore';
import {
  EMPTY_SERVER_CART,
  clampCartQuantity,
  removeServerItem,
  setServerItemQuantity,
  toCartItem,
  toCartLineInput,
} from '@/features/cart/services/cart-mapper';
import { cartFocusRefetchMode, createServerCartMutationOptions } from '@/features/cart/services/cart-sync';
import { mutationKeys } from '@/features/cart/services/mutation-keys';
import { addCartItem, clearServerCart, removeCartItem, updateCartItem } from '@/features/cart/services/mutations';
import { fetchCart } from '@/features/cart/services/queries';
import { queryKeys } from '@/features/cart/services/query-keys';
import { useCartStore } from '@/features/cart/store/cartStore';
import type { CartLineInput, ServerCart } from '@/features/cart/types/cart-api';
import type { CartItem } from '@/features/cart/types/cart-store';
import { toCommerceParams, trackEvent } from '@/lib/analytics';
import { getErrorMessage } from '@/lib/errors';
import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';

const CART_STALE_TIME_MS = 30 * 1000;

function notifyCartError(error: unknown, fallbackMessage: string) {
  toast.error(getErrorMessage(error, fallbackMessage));
}

/**
 * Giỏ hàng cho UI. Đã đăng nhập: giỏ lưu trên server, đồng bộ giữa các thiết bị.
 * Chưa đăng nhập: giỏ khách lưu trên thiết bị (Zustand persist), CartSync gộp lên
 * server khi đăng nhập.
 */
export function useCart() {
  const queryClient = useQueryClient();
  const status = useAuthStore((state) => state.status);
  const userId = useAuthStore((state) => state.user?.id || null);
  const isServerCart = status === 'authenticated' && Boolean(userId);

  const guestItems = useCartStore((state) => state.cartItems);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen);
  const isMergingGuestCart = useIsMutating({ mutationKey: mutationKeys.merge() }) > 0;

  const cartQuery = useQuery({
    queryKey: queryKeys.cart(userId),
    queryFn: fetchCart,
    enabled: isServerCart,
    staleTime: CART_STALE_TIME_MS,
    // Toàn app tắt refetch khi focus; giỏ cần bật để thấy thay đổi từ thiết bị khác.
    refetchOnWindowFocus: () => cartFocusRefetchMode(queryClient),
  });
  const serverCart = cartQuery.data;
  const refetch = cartQuery.refetch;

  const cartItems = useMemo(
    () => (isServerCart ? (serverCart ?? EMPTY_SERVER_CART).items.map(toCartItem) : guestItems),
    [isServerCart, serverCart, guestItems],
  );
  const purchasableItems = useMemo(() => cartItems.filter((item) => item.available !== false), [cartItems]);

  const { mutate: addServerItem } = useMutation(
    createServerCartMutationOptions<ServerCart, CartLineInput>(queryClient, {
      userId,
      mutationKey: mutationKeys.addItem(),
      mutationFn: addCartItem,
      errorMessage: 'Không thể thêm sản phẩm vào giỏ hàng.',
      notifyError: notifyCartError,
    }),
  );
  const { mutate: updateServerItem } = useMutation(
    createServerCartMutationOptions<ServerCart, { id: string; quantity: number }>(queryClient, {
      userId,
      mutationKey: mutationKeys.updateItem(),
      mutationFn: updateCartItem,
      optimistic: (cart, { id, quantity }) => setServerItemQuantity(cart, id, quantity),
      errorMessage: 'Không thể cập nhật số lượng sản phẩm.',
      notifyError: notifyCartError,
    }),
  );
  const { mutate: removeServerCartItem } = useMutation(
    createServerCartMutationOptions<ServerCart, string>(queryClient, {
      userId,
      mutationKey: mutationKeys.removeItem(),
      mutationFn: removeCartItem,
      optimistic: removeServerItem,
      errorMessage: 'Không thể xoá sản phẩm khỏi giỏ hàng.',
      notifyError: notifyCartError,
    }),
  );
  const { mutate: clearServerItems } = useMutation(
    createServerCartMutationOptions<ServerCart, void>(queryClient, {
      userId,
      mutationKey: mutationKeys.clear(),
      mutationFn: () => clearServerCart(),
      optimistic: () => EMPTY_SERVER_CART,
      errorMessage: 'Không thể xoá giỏ hàng.',
      notifyError: notifyCartError,
    }),
  );

  const addToCart = useCallback(
    (item: Omit<CartItem, 'id'>) => {
      trackEvent('add_to_cart', toCommerceParams([cartItemToGaItem(item)]));
      if (!isServerCart) {
        useCartStore.getState().addToCart(item);
        return;
      }
      addServerItem(toCartLineInput(item));
    },
    [isServerCart, addServerItem],
  );

  const updateQuantity = useCallback(
    (id: string, delta: number) => {
      const line = cartItems.find((item) => item.id === id);
      if (line && delta !== 0 && line.quantity + delta >= 1) {
        trackEvent(
          delta > 0 ? 'add_to_cart' : 'remove_from_cart',
          toCommerceParams([cartItemToGaItem(line, Math.abs(delta))]),
        );
      }
      if (!isServerCart) {
        useCartStore.getState().updateQuantity(id, delta);
        return;
      }
      // Đọc từ cache (đã gồm optimistic update) để bấm liên tục vẫn cộng dồn đúng,
      // rồi gửi số lượng cuối cùng cho BE.
      const current = queryClient
        .getQueryData<ServerCart>(queryKeys.cart(userId))
        ?.items.find((item) => item.id === id);
      if (!current) return;
      const quantity = clampCartQuantity(current.quantity + delta);
      if (quantity !== current.quantity) updateServerItem({ id, quantity });
    },
    [cartItems, isServerCart, queryClient, userId, updateServerItem],
  );

  const removeFromCart = useCallback(
    (id: string) => {
      const line = cartItems.find((item) => item.id === id);
      if (line) trackEvent('remove_from_cart', toCommerceParams([cartItemToGaItem(line)]));
      if (isServerCart) removeServerCartItem(id);
      else useCartStore.getState().removeFromCart(id);
    },
    [cartItems, isServerCart, removeServerCartItem],
  );

  const clearCart = useCallback(() => {
    if (isServerCart) clearServerItems();
    else useCartStore.getState().clearCart();
  }, [isServerCart, clearServerItems]);

  // Sau khi thanh toán xong: BE đã tự bỏ món đã mua khỏi giỏ server, chỉ cần tải lại.
  // Không xoá cả giỏ để giữ món vừa thêm từ thiết bị khác.
  const refreshAfterPayment = useCallback(() => {
    if (isServerCart) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart(userId) });
      return;
    }
    useCartStore.getState().clearCart();
  }, [isServerCart, queryClient, userId]);

  const totalItems = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);
  const totalPrice = useMemo(
    () => purchasableItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [purchasableItems],
  );

  return {
    cartItems,
    purchasableItems,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshAfterPayment,
    totalItems,
    totalPrice,
    // Đang gộp giỏ khách: chưa hiện "giỏ trống" / chưa báo giá trên giỏ thiếu món.
    isLoading: status === 'loading' || (isServerCart && (cartQuery.isPending || isMergingGuestCart)),
    // Không tải được giỏ server: hiện lỗi + thử lại, không hiện như giỏ trống.
    isError: isServerCart && cartQuery.isError && !serverCart,
    refetch,
  };
}
