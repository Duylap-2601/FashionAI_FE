'use client';

import { mutationKeys } from '@/features/measurements/services/mutation-keys';
import { queryKeys as measurementsQueryKeys } from '@/features/measurements/services/query-keys';
import { updateMeasurements } from '@/features/measurements/services/mutations';
import { fetchMeasurements, fetchUserMeasurements } from '@/features/measurements/services/queries';
import type { UserMeasurements } from '@/features/measurements/types/measurements';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useMeasurements() {
  const status = useAuthStore((state) => state.status);
  const queryClient = useQueryClient();

  const measurementsQuery = useQuery<UserMeasurements>({
    queryKey: measurementsQueryKeys.measurements(),
    queryFn: fetchMeasurements,
    enabled: status === 'authenticated',
  });

  const updateMeasurementsMutation = useMutation({
    mutationKey: mutationKeys.measurements(),
    mutationFn: updateMeasurements,
    onSuccess: (data) => {
      queryClient.setQueryData(measurementsQueryKeys.measurements(), data);
    },
  });

  return {
    measurements: measurementsQuery.data,
    isLoading: status === 'loading' || measurementsQuery.isLoading,
    isError: measurementsQuery.isError,
    updateMeasurements: updateMeasurementsMutation.mutate,
    isUpdating: updateMeasurementsMutation.isPending,
  };
}

export function useUserMeasurements(userId?: string) {
  const status = useAuthStore((state) => state.status);

  const query = useQuery<UserMeasurements>({
    queryKey: measurementsQueryKeys.userMeasurements(userId || ''),
    queryFn: () => fetchUserMeasurements(userId!),
    enabled: status === 'authenticated' && Boolean(userId),
  });

  return {
    measurements: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
