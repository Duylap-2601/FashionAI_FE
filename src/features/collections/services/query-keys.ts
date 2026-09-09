// Preserve existing cache prefixes and parameter order, including partial invalidation.
export const queryKeys = {
  collections: <T extends readonly unknown[]>(...params: T) => ['collections', ...params] as const,
  collection: <T extends readonly unknown[]>(...params: T) => ['collection', ...params] as const,
  collectionProducts: <T extends readonly unknown[]>(...params: T) => ['collection-products', ...params] as const,
  adminCollections: <T extends readonly unknown[]>(...params: T) => ['admin-collections', ...params] as const,
};
