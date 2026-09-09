import type { UserMeasurements } from '@/features/measurements/types/measurements';

export interface ChatEmptyStateProps {
  onSelectPrompt: (promptText: string) => void;
  userMeasurements?: UserMeasurements | null;
  userName?: string;
}
