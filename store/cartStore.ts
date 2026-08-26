import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
  hasTryOn?: boolean;
  color?: string;
  type?: string;
}

interface CartStore {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

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
          const updated = [...prev];
          updated[existingIndex].quantity += newItem.quantity;
          set({ cartItems: updated });
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
      totalItems: () => get().cartItems.reduce((acc, item) => acc + item.quantity, 0),
      totalPrice: () => get().cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    {
      name: 'stale_cart', // local storage key
    }
  )
);

export function useCart() {
  const store = useCartStore();
  const totalItems = useCartStore(state => state.totalItems());
  const totalPrice = useCartStore(state => state.totalPrice());
  return {
    ...store,
    totalItems,
    totalPrice
  };
}
