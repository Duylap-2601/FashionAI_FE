export interface ConfirmDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note?: string) => void | Promise<void>;
  isLoading?: boolean;
  orderCode: string | number;
}
