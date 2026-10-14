// Giỏ server theo từng user: ['cart', userId]. Đổi tài khoản không thấy cache của người trước.
export const queryKeys = {
  cart: <T extends readonly unknown[]>(...params: T) => ['cart', ...params] as const,
};
