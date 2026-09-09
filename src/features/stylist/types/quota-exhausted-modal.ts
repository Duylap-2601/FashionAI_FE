export interface QuotaExhaustedModalProps {
  onClose: () => void;
  actionName?: string;
  resetAt?: string | null;
  requested?: number;
  remaining?: number;
}
