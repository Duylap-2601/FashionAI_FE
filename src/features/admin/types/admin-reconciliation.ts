export interface ReconciliationCandidate {
  orderCode: number;
  amount: number;
  targetTier?: 'MEMBER' | 'VIP' | string | null;
  status: string;
  userEmail: string;
  createdAt: string;
  minutesApart: number;
}

export interface UnmatchedTransaction {
  id: string;
  reason: string;
  transferAmount: number;
  code?: string;
  content: string;
  transactionDate: string;
  referenceCode: string;
  gateway: string;
  accountNumber?: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt?: string | null;
  candidates: ReconciliationCandidate[];
}

export interface UnmatchedTransactionsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UnmatchedTransactionsResponse {
  items?: UnmatchedTransaction[];
  data?: UnmatchedTransaction[];
  meta?: UnmatchedTransactionsMeta;
  __meta?: UnmatchedTransactionsMeta;
}

export interface ConfirmManualPaymentPayload {
  reference: string;
  note: string;
}

export interface ReconciliationFilters {
  resolved: boolean;
  search: string;
}

export interface ReconciliationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
