import type { StylistResult } from '@/features/stylist/types/stylist';
import React from 'react';

export interface StylistHistoryPanelProps {
  setHistoryOpen: React.Dispatch<React.SetStateAction<boolean>>;
  historyOpen: boolean;
  meta: import("@/features/stylist/types/stylist").StylistHistoryMeta | undefined;
  history: StylistResult[];
  handleSelectHistoryItem: (item: StylistResult) => void;
  handleDeleteHistory: (e: React.MouseEvent, item: StylistResult) => Promise<void>;
  isDeleting: boolean;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  page: number;
}
