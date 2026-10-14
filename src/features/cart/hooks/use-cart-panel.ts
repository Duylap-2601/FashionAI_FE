'use client';

import { useCartStore } from '@/features/cart/store/cartStore';

// Chỉ cần trạng thái mở/đóng panel, không cần tải giỏ.
export function useCartPanel() {
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen);
  return { isCartOpen, setIsCartOpen };
}
