export interface CheckoutSummaryProps {
  items: import("@/features/cart/types/cart-store").CartItem[];
  totalPrice: number;
  shippingFee: number;
  discount: number;
  total: number;
  isSubmitting: boolean;
}
