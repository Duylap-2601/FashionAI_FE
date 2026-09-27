'use client';

import { addressQueryKeys, createUserAddress, deleteUserAddress, getUserAddresses, setDefaultUserAddress, updateUserAddress } from '@/features/profile/services/addresses';
import type { UserAddressInput } from '@/features/profile/types/addresses';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useUserAddresses() {
  return useQuery({
    queryKey: addressQueryKeys.all,
    queryFn: ({ signal }) => getUserAddresses(signal),
  });
}

export function useAddressMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: addressQueryKeys.all });
  return {
    createAddress: useMutation({ mutationFn: createUserAddress, onSuccess: invalidate }),
    updateAddress: useMutation({ mutationFn: ({ id, payload }: { id: string; payload: UserAddressInput }) => updateUserAddress(id, payload), onSuccess: invalidate }),
    deleteAddress: useMutation({ mutationFn: deleteUserAddress, onSuccess: invalidate }),
    setDefaultAddress: useMutation({ mutationFn: setDefaultUserAddress, onSuccess: invalidate }),
  };
}
