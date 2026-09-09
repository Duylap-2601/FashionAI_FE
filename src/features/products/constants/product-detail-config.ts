import type { ComboType } from '@/features/products/types/product-detail-config';

export const COMBO_OPTIONS: { value: ComboType; label: string; price: number }[] = [
  { value: 'combo', label: 'Combo Suit nguyên bộ', price: 1290000 },
  { value: 'blazer', label: 'Bán lẻ Áo Blazer', price: 750000 },
  { value: 'retail', label: 'Sơ mi / Váy / Quần tây', price: 550000 },
];
