import { CART_MUTATION_SCOPE, mutationKeys } from '@/features/cart/services/mutation-keys';
import { queryKeys } from '@/features/cart/services/query-keys';
import type { ServerCart } from '@/features/cart/types/cart-api';
import type { CartSyncAction, CartSyncState, ServerCartMutationConfig } from '@/features/cart/types/cart-sync';
import type { MutationOptions, QueryClient } from '@tanstack/react-query';

// cart:updated tới khi thiết bị này còn mutation giỏ đang chạy: tải lại ngay sẽ đè
// optimistic state, nên chỉ đánh dấu; mutation cuối thấy cờ thì tải lại thay vì tin
// response của nó (response có thể chưa gồm thay đổi từ thiết bị khác).
let remoteChangePending = false;

function pendingCartMutations(queryClient: QueryClient) {
  return queryClient.isMutating({ mutationKey: mutationKeys.all() });
}

export function handleRemoteCartChange(queryClient: QueryClient) {
  if (pendingCartMutations(queryClient) > 0) {
    remoteChangePending = true;
    return;
  }
  void queryClient.invalidateQueries({ queryKey: queryKeys.cart() });
}

// Không refetch khi focus lúc còn mutation: response cũ sẽ ghi đè thay đổi chưa gửi xong
// và lần bấm tiếp theo tính số lượng từ giá trị sai.
export function cartFocusRefetchMode(queryClient: QueryClient): boolean | 'always' {
  return pendingCartMutations(queryClient) > 0 ? false : 'always';
}

/**
 * Options chung cho mọi mutation giỏ server: chạy tuần tự trong một scope (optimistic
 * update vẫn hiện ngay), và chỉ mutation cuối trong hàng đợi mới ghi response vào cache.
 */
export function createServerCartMutationOptions<TData extends ServerCart, TVariables>(
  queryClient: QueryClient,
  config: ServerCartMutationConfig<TData, TVariables>,
): MutationOptions<TData, unknown, TVariables> {
  const queryKey = queryKeys.cart(config.userId);
  const { optimistic } = config;

  return {
    mutationKey: config.mutationKey,
    scope: CART_MUTATION_SCOPE,
    retry: config.retry ?? 0,
    mutationFn: config.mutationFn,
    onMutate: async (variables) => {
      if (!optimistic) return;
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData<ServerCart>(queryKey, (current) => (current ? optimistic(current, variables) : current));
    },
    onSuccess: (data, variables) => {
      config.onSuccess?.(data, variables);
    },
    onError: (error) => {
      config.notifyError(error, config.errorMessage);
    },
    onSettled: async (data) => {
      // Response của mutation cuối đã gồm mọi thay đổi trước đó (chạy tuần tự). Còn
      // mutation khác đang chờ thì giữ optimistic state để không nhấp nháy.
      if (pendingCartMutations(queryClient) > 1) return;
      // Huỷ GET /cart đang bay (bắt đầu trước khi ghi xong) để nó không đè kết quả mới.
      await queryClient.cancelQueries({ queryKey });
      if (data && !remoteChangePending) {
        queryClient.setQueryData(queryKey, data);
        return;
      }
      remoteChangePending = false;
      await queryClient.invalidateQueries({ queryKey });
    },
  };
}

// Quyết định việc cần làm với giỏ khách khi trạng thái đăng nhập đổi.
export function decideCartSyncAction({ prevStatus, status, userId, mergedFor }: CartSyncState): CartSyncAction {
  if (status === 'unauthenticated') {
    // Đăng xuất / hết phiên: xoá giỏ khách còn sót để người sau không thấy.
    return prevStatus === 'authenticated' ? 'clear-guest' : 'none';
  }
  if (status === 'authenticated' && userId && mergedFor !== userId) return 'merge';
  return 'none';
}
