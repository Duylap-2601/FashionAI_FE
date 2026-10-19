import type { StylistResult } from '@/features/stylist/types/stylist';
import React from 'react';

export interface StylistResultPanelProps {
  resultRef: React.RefObject<HTMLDivElement | null>;
  displayResult: StylistResult;
}
