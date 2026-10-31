export interface CartItem {
  id: string;
  productId: string;
  name: string;
  variant: string;
  price: number;
  listPrice?: number;
  salePercent?: number;
  quantity: number;
  image: string;
  hasTryOn?: boolean;
  color?: string;
  type?: string;
  // Chỉ có ở giỏ server: false khi sản phẩm đã ngừng bán, không đưa vào checkout.
  available?: boolean;
}

// Giỏ khách (chưa đăng nhập) lưu trên thiết bị, cùng trạng thái mở/đóng panel giỏ.
export interface CartStore {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
}
