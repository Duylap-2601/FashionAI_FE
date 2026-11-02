import React from 'react';

export interface CheckoutSummaryProps {
  items: import("@/features/cart/types/cart-store").CartItem[];
  totalPrice: number;
  saleDiscount?: number;
  // null: chưa có báo giá cho địa chỉ / món hàng hiện tại.
  shippingFee: number | null;
  discount: number;
  total: number;
  isSubmitting: boolean;
  submitLabel: string;
  isPricingLoading?: boolean;
  pricingError?: string | null;
  couponError?: string | null;
  coupon: string;
  setCoupon: React.Dispatch<React.SetStateAction<string>>;
  setDiscount: React.Dispatch<React.SetStateAction<number>>;
  handleApplyCoupon: () => void;
}
