import type { SubscriptionStatus } from '@/features/subscription/types/subscription';

export interface SubscriptionHistoryProps {
  isHistoryLoading: boolean;
  history: import("@/features/subscription/types/subscription").SubscriptionHistoryItem[];
  formatDate: (isoString?: string | null) => string;
  getStatusBadge: (subStatus: SubscriptionStatus) => import("D:/workplace/projects/EXE/FashionAI_FE/node_modules/@types/react/index").JSX.Element;
  historyMeta: { total: number; page: number; limit: number; totalPages: number; } | undefined;
  setHistoryPage: import("D:/workplace/projects/EXE/FashionAI_FE/node_modules/@types/react/index").Dispatch<import("D:/workplace/projects/EXE/FashionAI_FE/node_modules/@types/react/index").SetStateAction<number>>;
  historyPage: number;
}
