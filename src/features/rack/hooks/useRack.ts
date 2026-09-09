'use client';

import { mutationKeys } from '@/features/rack/services/mutation-keys';
import { queryKeys as rackQueryKeys } from '@/features/rack/services/query-keys';
import { clearRack, pinToRack, unpinFromRack } from '@/features/rack/services/mutations';
import { fetchRackItems } from '@/features/rack/services/queries';
import type { RackItem } from '@/features/rack/types/rack';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useRackItems() {
  const status = useAuthStore((state) => state.status);
  const query = useQuery<RackItem[]>({
    queryKey: rackQueryKeys.rack(),
    queryFn: fetchRackItems,
    enabled: status === 'authenticated',
  });

  const items = query.data || [];

  const isPinned = (productId: string) => {
    return items.some((item) => item.productId === productId || item.product?.id === productId);
  };

  const getItemByProductId = (productId: string) => {
    return items.find((item) => item.productId === productId || item.product?.id === productId);
  };

  return {
    items,
    isPinned,
    getItemByProductId,
    isLoading: status === 'loading' || query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function usePinToRack() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: mutationKeys.pinToRack(),
    mutationFn: pinToRack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rackQueryKeys.rack() });
    },
  });

  return {
    pinProduct: mutation.mutate,
    pinProductAsync: mutation.mutateAsync,
    isPinning: mutation.isPending,
  };
}

export function useUnpinFromRack() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: mutationKeys.unpinFromRack(),
    mutationFn: unpinFromRack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rackQueryKeys.rack() });
    },
  });

  return {
    unpinProduct: mutation.mutate,
    unpinProductAsync: mutation.mutateAsync,
    isUnpinning: mutation.isPending,
  };
}

export function useClearRack() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: mutationKeys.clearRack(),
    mutationFn: clearRack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rackQueryKeys.rack() });
    },
  });

  return {
    clearRack: mutation.mutate,
    clearRackAsync: mutation.mutateAsync,
    isClearing: mutation.isPending,
  };
}
