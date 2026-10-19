import type { StylistHistoryMeta, StylistResult } from '@/features/stylist/types/stylist';
import React from 'react';

export interface StylistHistoryPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meta: StylistHistoryMeta | undefined;
  history: StylistResult[];
  selectedId: string | null;
  handleSelectHistoryItem: (item: StylistResult) => void;
  handleDeleteHistory: (e: React.MouseEvent, item: StylistResult) => Promise<void>;
  isDeleting: boolean;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  page: number;
}
