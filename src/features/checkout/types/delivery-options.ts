import React from 'react';

export interface DeliveryOptionsProps {
  paymentMethod: "cod" | "bank";
  setPaymentMethod: React.Dispatch<React.SetStateAction<"cod" | "bank">>;
}
