import type { CanvasPlacedItem } from '@/features/rack/types/rack';

export interface MannequinDressFormProps {
  placedItems: CanvasPlacedItem[];
  selectedId: string | null;
  onSelect: (instanceId: string | null) => void;
  onUpdateTransform: (
    instanceId: string,
    updates: Partial<Pick<CanvasPlacedItem, 'x' | 'y' | 'scale' | 'rotation' | 'zIndex'>>
  ) => void;
  onBringForward: (instanceId: string) => void;
  onSendBackward: (instanceId: string) => void;
  onResetItemTransform: (instanceId: string) => void;
  onRemoveItem: (instanceId: string) => void;
  onReset: () => void;
  onGoToTryOn: () => void;
}

