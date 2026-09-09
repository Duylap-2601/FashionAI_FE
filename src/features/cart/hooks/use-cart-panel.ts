'use client';

import { useCart } from '@/features/cart/store/cartStore';

export function useCartPanel() {
  const { isCartOpen, setIsCartOpen } = useCart();
  return { isCartOpen, setIsCartOpen };
}
