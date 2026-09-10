import React from 'react';

export interface DeliveryOptionsProps {
  paymentMethod: "bank";
  setPaymentMethod: React.Dispatch<React.SetStateAction<"bank">>;
}
