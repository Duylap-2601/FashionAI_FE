import type { CartStore } from '@/features/cart/types/cart-store';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Giỏ khách: chỉ dùng khi chưa đăng nhập. Đăng nhập thì CartSync gộp lên server rồi xoá.
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],
      isCartOpen: false,
      setIsCartOpen: (open) => set({ isCartOpen: open }),
      addToCart: (newItem) => {
        const prev = get().cartItems;
        const existingIndex = prev.findIndex(item =>
          item.productId === newItem.productId &&
          item.color === newItem.color &&
          item.type === newItem.type
        );

        if (existingIndex > -1) {
          set({
            cartItems: prev.map((item, index) =>
              index === existingIndex ? { ...item, quantity: item.quantity + newItem.quantity } : item
            ),
          });
        } else {
          const id = `${newItem.productId}-${newItem.color || 'default'}-${newItem.type || ''}-${Date.now()}`;
          set({ cartItems: [...prev, { ...newItem, id }] });
        }
      },
      removeFromCart: (id) => {
        set({ cartItems: get().cartItems.filter(item => item.id !== id) });
      },
      updateQuantity: (id, delta) => {
        set({
          cartItems: get().cartItems.map(item => {
            if (item.id === id) {
              return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
          })
        });
      },
      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: 'stale_cart', // local storage key
      // Không lưu trạng thái mở panel: tải lại trang không tự bật giỏ hàng.
      partialize: (state) => ({ cartItems: state.cartItems }),
    }
  )
);
