export const mutationKeys = {
  all: () => ['cart'] as const,
  addItem: () => ['cart', 'addItem'] as const,
  updateItem: () => ['cart', 'updateItem'] as const,
  removeItem: () => ['cart', 'removeItem'] as const,
  clear: () => ['cart', 'clear'] as const,
  merge: () => ['cart', 'merge'] as const,
};

// Mọi mutation giỏ server chạy tuần tự theo đúng thứ tự bấm (optimistic update vẫn hiện ngay).
export const CART_MUTATION_SCOPE = { id: 'cart' } as const;
