import type { ComboType } from '@/features/products/types/product-detail-config';

export function getComboPrice(type: ComboType) {
  if (type === 'combo') return 1290000;
  if (type === 'blazer') return 750000;
  return 550000;
}

export function getComboDisplayPrice(type: ComboType) {
  return `${getComboPrice(type).toLocaleString('vi-VN')}đ`;
}

export function getComboOriginalPrice(type: ComboType) {
  if (type === 'combo') return '1.650.000đ';
  if (type === 'blazer') return '950.000đ';
  return '690.000đ';
}

export function getComboDiscount(type: ComboType) {
  if (type === 'combo') return '-22%';
  if (type === 'blazer') return '-21%';
  return '-20%';
}
