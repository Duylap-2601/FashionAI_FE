import type { Review } from '@/features/reviews/types/reviews';

export interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  isAdmin?: boolean;
  onEdit?: (review: Review) => void;
  onDelete?: (review: Review) => void;
  onAdminDelete?: (review: Review) => void;
}
