import type { Product } from '@/features/products/types/products';
import type { StylistResult } from '@/features/stylist/types/stylist';
import React from 'react';

export interface StylistResultPanelProps {
  resultRef: React.RefObject<HTMLDivElement | null>;
  displayResult: StylistResult;
  /** Catalog để dò sản phẩm tương tự cho kết quả cũ chưa có bộ phối từ catalog. */
  catalogProducts: Product[];
}
