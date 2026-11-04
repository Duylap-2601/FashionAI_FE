export interface ConfirmDeliveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderCode: string;
  isPending?: boolean;
  onConfirm: () => void;
}
