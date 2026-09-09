import type { ReviewStats } from '@/features/reviews/types/reviews';

export interface RatingOverviewProps {
  stats?: ReviewStats;
  selectedRating?: number;
  onSelectRating: (rating?: number) => void;
  isLoading?: boolean;
}
