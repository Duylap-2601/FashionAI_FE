import React from 'react';

export type CheckoutPaymentMethod = 'zalopay' | 'sepay';

export interface DeliveryOptionsProps {
  paymentMethod: CheckoutPaymentMethod;
  setPaymentMethod: React.Dispatch<React.SetStateAction<CheckoutPaymentMethod>>;
}
