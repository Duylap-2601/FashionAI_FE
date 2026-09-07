/**
 * Backend Prisma collection shape (returned from NestJS API)
 */
export interface BackendCollection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  /** Up to 3 GCS/S3 image URLs used for the hero 3-panel banner */
  coverImages: string[];
  isPublished: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

/**
 * Frontend-enriched collection type (superset of BackendCollection).
 * All extra fields are optional and derived/computed on the FE side.
 */
export interface Collection extends BackendCollection {
  /** Convenience alias for coverImages[0] — used in carousel cards */
  thumbnail?: string;
  /** Short marketing tagline (not stored in DB — derived from description) */
  tagline?: string;
  /** Season label, e.g. "SPRING / SUMMER 2026" (not stored in DB) */
  season?: string;
  /** Optional extra editorial photos for the Lookbook section */
  lookbookImages?: string[];
  /** Product count shorthand — same as _count.products */
  itemCount?: number;
  /** Optional product IDs (for local fallback and relation mapping) */
  productIds?: string[];
}

/**
 * Map raw backend response to enriched frontend Collection.
 * Fills derived display fields automatically so components don't
 * have to handle undefined constantly.
 */
export function mapBackendCollection(raw: BackendCollection): Collection {
  return {
    ...raw,
    thumbnail: raw.coverImages?.[0] ?? undefined,
    // Use first sentence of description as tagline if short enough
    tagline: raw.description
      ? raw.description.length <= 100
        ? raw.description
        : raw.description.slice(0, 97) + '...'
      : undefined,
    itemCount: raw._count?.products,
    // lookbookImages not stored in DB — fall back to coverImages for lookbook
    lookbookImages: raw.coverImages?.length > 0 ? raw.coverImages : undefined,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Admin Create / Update DTOs (mirrors backend DTOs)
// ──────────────────────────────────────────────────────────────────────────────

export interface CreateCollectionDto {
  name: string;
  slug?: string;
  description?: string;
  isPublished?: boolean;
  displayOrder?: number;
  /** Files are handled separately as FormData */
}

export type UpdateCollectionDto = Partial<CreateCollectionDto>;
