'use client';

import { useAuthStore } from '@/features/auth/store/authStore';
import { markOrderChatRead, sendOrderChatMessage } from '@/features/orders/services/mutations';
import { fetchMyOrderChats, fetchOrderChat } from '@/features/orders/services/queries';
import { queryKeys as ordersQueryKeys } from '@/features/orders/services/query-keys';
import type { MyOrderChats, OrderChatMessage, OrderChatThread } from '@/features/orders/types/order-chat';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

type SendOrderChatResponse = {
  message: OrderChatMessage;
  unreadForCustomer: number;
  unreadForAdmin: number;
};

export function useOrderChat(orderId: string, isAdmin = false) {
  const queryClient = useQueryClient();
  const authStatus = useAuthStore((state) => state.status);

  const query = useInfiniteQuery({
    queryKey: ordersQueryKeys.orderChat(orderId),
    queryFn: ({ pageParam }) => fetchOrderChat(orderId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: OrderChatThread) => last.nextCursor ?? undefined,
    enabled: authStatus === 'authenticated' && Boolean(orderId),
    // Lưới an toàn khi socket realtime chưa kịp kết nối/rớt mạng: hội thoại tự
    // đồng bộ lại. Socket vẫn là đường chính, polling chỉ chống trễ.
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const messages = useMemo(() => {
    const pages = query.data?.pages ?? [];
    return pages.slice().reverse().flatMap((page) => page.messages);
  }, [query.data]);

  const sendMutation = useMutation({
    mutationFn: sendOrderChatMessage,
    onSuccess: (data) => {
      const response = data as SendOrderChatResponse;
      queryClient.setQueryData(ordersQueryKeys.orderChat(orderId), (current: unknown) => {
        if (!current || typeof current !== 'object' || !('pages' in current)) return current;
        const infinite = current as { pages: OrderChatThread[]; pageParams: unknown[] };
        if (!infinite.pages.length) return current;
        const first = infinite.pages[0];
        if (first.messages.some((message) => message.id === response.message.id)) return current;
        const pages = [...infinite.pages];
        pages[0] = {
          ...first,
          messages: [...first.messages, response.message],
          unreadForCustomer: response.unreadForCustomer,
          unreadForAdmin: response.unreadForAdmin,
        };
        return { ...infinite, pages };
      });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.order(orderId) });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.orders() });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.orderChat('mine') });
    },
  });

  const readMutation = useMutation({
    mutationFn: (upToMessageId?: string) => markOrderChatRead(orderId, upToMessageId),
    onSuccess: () => {
      queryClient.setQueryData(ordersQueryKeys.orderChat(orderId), (current: unknown) => {
        if (!current || typeof current !== 'object' || !('pages' in current)) return current;
        const infinite = current as { pages: OrderChatThread[]; pageParams: unknown[] };
        if (!infinite.pages.length) return current;
        const pages = [...infinite.pages];
        pages[0] = isAdmin
          ? { ...pages[0], unreadForAdmin: 0 }
          : { ...pages[0], unreadForCustomer: 0 };
        return { ...infinite, pages };
      });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.order(orderId) });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.orders() });
      queryClient.invalidateQueries({ queryKey: ordersQueryKeys.orderChat('mine') });
    },
  });

  const latestPage = query.data?.pages[0];

  return {
    messages,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    unread: isAdmin ? latestPage?.unreadForAdmin ?? 0 : latestPage?.unreadForCustomer ?? 0,
    isLocked: latestPage?.locked ?? false,
    sendMessage: sendMutation.mutate,
    isSending: sendMutation.isPending,
    markRead: readMutation.mutate,
  };
}

export function useMyOrderChats() {
  const authStatus = useAuthStore((state) => state.status);
  const query = useQuery<MyOrderChats>({
    queryKey: ordersQueryKeys.orderChat('mine'),
    queryFn: fetchMyOrderChats,
    enabled: authStatus === 'authenticated',
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return {
    threads: query.data?.threads ?? [],
    orders: query.data?.orders ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
