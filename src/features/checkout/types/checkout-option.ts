import type React from 'react';

export interface CheckoutOptionProps {
  name: string;
  value: string;
  checked: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}
