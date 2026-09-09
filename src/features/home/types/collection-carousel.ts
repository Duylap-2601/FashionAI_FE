import { Collection } from '@/features/collections/types/collection';

export interface CollectionCarouselProps {
  collections: Collection[];
  onSelectCollection?: (collection: Collection) => void;
  selectedCollectionId?: string | null;
}
