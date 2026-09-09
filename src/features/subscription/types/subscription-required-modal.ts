export interface SubscriptionRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'free_not_allowed' | 'subscription_expired' | string;
  actionName?: string;
}
