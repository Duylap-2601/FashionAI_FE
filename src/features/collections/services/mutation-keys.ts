export const mutationKeys = {
  createCollection: () => ['collections', 'createCollection'] as const,
  updateCollection: () => ['collections', 'updateCollection'] as const,
  deleteCollection: () => ['collections', 'deleteCollection'] as const,
  addProductToCollection: () => ['collections', 'addProductToCollection'] as const,
  removeProductFromCollection: () => ['collections', 'removeProductFromCollection'] as const,
};
