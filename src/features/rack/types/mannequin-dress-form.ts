import type { RackItem } from '@/features/rack/types/rack';

export interface MannequinDressFormProps {
  upperItem: RackItem | null;
  lowerItem: RackItem | null;
  fullBodyItem: RackItem | null;
  onRemoveUpper: () => void;
  onRemoveLower: () => void;
  onRemoveFullBody: () => void;
  onReset: () => void;
  onGoToTryOn: () => void;
}
