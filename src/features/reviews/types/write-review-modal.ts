import type { Review } from '@/features/reviews/types/reviews';

export interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productImage?: string;
  orderId?: string;
  editingReview?: Review | null;
}
