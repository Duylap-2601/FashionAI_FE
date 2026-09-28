import type { UserAddress, UserAddressInput } from '@/features/profile/types/addresses';
import { http } from '@/lib/http';

export const addressQueryKeys = {
  all: ['profile', 'addresses'] as const,
};

export function getUserAddresses(signal?: AbortSignal) {
  return http.get<UserAddress[]>('/users/me/addresses', { signal });
}

export function createUserAddress(payload: UserAddressInput) {
  return http.post<UserAddress>('/users/me/addresses', payload);
}

export function updateUserAddress(id: string, payload: UserAddressInput) {
  return http.patch<UserAddress>(`/users/me/addresses/${id}`, payload);
}

export function deleteUserAddress(id: string) {
  return http.delete<{ deleted: boolean }>(`/users/me/addresses/${id}`);
}

export function setDefaultUserAddress(id: string) {
  return http.patch<UserAddress>(`/users/me/addresses/${id}/default`);
}
