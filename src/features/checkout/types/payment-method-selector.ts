import React from 'react';

export interface PaymentMethodSelectorProps {
  coupon: string;
  setCoupon: React.Dispatch<React.SetStateAction<string>>;
  discount: number;
  setDiscount: React.Dispatch<React.SetStateAction<number>>;
  handleApplyCoupon: () => void;
}
