
import type { toColorList, toOutfitList } from '@/features/stylist/services/result-lists';
import type { StylistResult } from '@/features/stylist/types/stylist';
import React from 'react';

export interface StylistResultPanelProps {
  resultRef: React.RefObject<HTMLDivElement | null>;
  displayResult: StylistResult;
  toColorList: typeof toColorList;
  score: number | null | undefined;
  scoreColor: "bg-neutral-200" | "bg-semantic-success" | "bg-amber-500" | "bg-red-500";
  scoreLabel: "Chưa đủ dữ liệu" | "Rất phù hợp" | "Tương đối phù hợp" | "Ít phù hợp";
  occasion: string;
  toOutfitList: typeof toOutfitList;
  getOutfitIcon: (type: string) => React.JSX.Element;
}
