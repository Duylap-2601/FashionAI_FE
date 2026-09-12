import React from 'react';

export interface CheckoutSummaryProps {
  items: import("@/features/cart/types/cart-store").CartItem[];
  totalPrice: number;
  shippingFee: number;
  discount: number;
  total: number;
  isSubmitting: boolean;
  coupon: string;
  setCoupon: React.Dispatch<React.SetStateAction<string>>;
  setDiscount: React.Dispatch<React.SetStateAction<number>>;
  handleApplyCoupon: () => void;
}
