import type { AuthStatus } from '@/features/auth/types/auth-store';
import type { CartLineInput, ServerCart } from '@/features/cart/types/cart-api';
import type { CartItem } from '@/features/cart/types/cart-store';

export interface AddServerItemVariables {
  line: CartLineInput;
  // Thông tin hiển thị từ trang gọi, để dòng tạm có tên, giá, ảnh ngay.
  item: Omit<CartItem, 'id'>;
}

export interface ServerCartMutationConfig<TData extends ServerCart, TVariables> {
  userId: string | null;
  mutationKey: readonly unknown[];
  mutationFn: (variables: TVariables) => Promise<TData>;
  // Cập nhật cache ngay khi bấm; bỏ trống thì chờ response.
  optimistic?: (cart: ServerCart, variables: TVariables) => ServerCart;
  errorMessage: string;
  notifyError: (error: unknown, fallbackMessage: string) => void;
  onSuccess?: (data: TData, variables: TVariables) => void;
  retry?: number;
  // false: gửi ngay, không chờ các mutation giỏ trước đó (mặc định true: chạy tuần tự).
  // Xoá dòng dùng false để lệnh xoá đã hiện trên UI không nằm chờ rồi mất khi tải lại trang.
  queued?: boolean;
}

export interface GuestCartMergeVariables {
  lines: CartLineInput[];
  // Id các món giỏ khách đã gửi: chỉ xoá đúng những món này khi gộp xong.
  guestIds: string[];
  userId: string;
}

export type CartSyncAction = 'merge' | 'clear-guest' | 'none';

export interface CartSyncState {
  prevStatus: AuthStatus;
  status: AuthStatus;
  userId: string | null;
  // User đã gộp giỏ khách trong phiên này (tránh gộp lại mỗi lần render).
  mergedFor: string | null;
}
