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

export interface CartStore {
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
