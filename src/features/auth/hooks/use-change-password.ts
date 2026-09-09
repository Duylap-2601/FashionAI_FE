'use client';

import { mutationKeys } from '@/features/auth/services/mutation-keys';
import { changePassword } from '@/features/auth/services/password-mutations';
import { useMutation } from '@tanstack/react-query';

export function useChangePassword() {
  const changeMutation = useMutation({
    mutationKey: mutationKeys.changePassword(),
    mutationFn: changePassword,
  });

  return {
    changePassword: changeMutation.mutateAsync,
    isChanging: changeMutation.isPending,
    error: changeMutation.error,
  };
}
