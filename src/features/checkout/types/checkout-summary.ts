export interface CheckoutSummaryProps {
  items: import("@/features/cart/types/cart-store").CartItem[];
  totalPrice: number;
  shippingFee: 0 | 50000;
  discount: number;
  total: number;
  isSubmitting: boolean;
}
