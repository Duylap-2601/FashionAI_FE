import type { BackendCollection, Collection } from '@/features/collections/types/collection';

export function mapBackendCollection(raw: BackendCollection): Collection {
  const defaultThumbnail = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=85';
  const coverImages = raw.coverImages && raw.coverImages.length > 0 ? raw.coverImages : [defaultThumbnail];

  return {
    ...raw,
    coverImages,
    thumbnail: coverImages[0] || defaultThumbnail,
    // Use first sentence of description as tagline if short enough
    tagline: raw.description
      ? raw.description.length <= 100
        ? raw.description
        : raw.description.slice(0, 97) + '...'
      : undefined,
    itemCount: raw._count?.products ?? 0,
    // lookbookImages not stored in DB — fall back to coverImages for lookbook
    lookbookImages: coverImages,
  };
}
