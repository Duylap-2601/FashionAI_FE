'use client';

import { mutationKeys } from '@/features/profile/services/mutation-keys';
import { queryKeys as profileQueryKeys } from '@/features/profile/services/query-keys';
import { updateUserProfile } from '@/features/profile/services/mutations';
import { fetchUserProfile } from '@/features/profile/services/queries';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { UserProfile } from '@/features/profile/types/profile';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useUserProfile() {
  const status = useAuthStore((state) => state.status);
  const queryClient = useQueryClient();

  const profileQuery = useQuery<UserProfile>({
    queryKey: profileQueryKeys.profile(),
    queryFn: fetchUserProfile,
    enabled: status === 'authenticated',
  });

  const updateProfileMutation = useMutation({
    mutationKey: mutationKeys.userProfile(),
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(profileQueryKeys.profile(), data);
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: status === 'loading' || profileQuery.isLoading,
    isError: profileQuery.isError,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  };
}
