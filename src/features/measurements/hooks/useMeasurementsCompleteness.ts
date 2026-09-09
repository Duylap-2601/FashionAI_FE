'use client';

import { queryKeys as measurementsQueryKeys } from '@/features/measurements/services/query-keys';
import { fetchMeasurementsCompleteness } from '@/features/measurements/services/queries';
import type { MeasurementCategoryCompleteness, MeasurementsCompletenessResponse } from '@/features/measurements/types/measurements-completeness';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useQuery } from '@tanstack/react-query';

export function useMeasurementsCompleteness() {
  const status = useAuthStore((state) => state.status);

  const query = useQuery<MeasurementsCompletenessResponse>({
    queryKey: measurementsQueryKeys.measurementsCompleteness(),
    queryFn: fetchMeasurementsCompleteness,
    enabled: status === 'authenticated',
    staleTime: 30000,
  });

  const getCategoryCompleteness = (category?: string | null): MeasurementCategoryCompleteness | undefined => {
    if (!query.data?.byCategory || !category) return undefined;
    const cat = category.toUpperCase();
    let target = 'UPPER';
    if (cat.includes('FULL_BODY') || cat.includes('ONE-PIECE') || cat.includes('SUIT') || cat.includes('TOAN THAN')) {
      target = 'FULL_BODY';
    } else if (cat.includes('LOWER') || cat.includes('BOTTOM') || cat.includes('QUAN') || cat.includes('VAY')) {
      target = 'LOWER';
    } else {
      target = 'UPPER';
    }
    return query.data.byCategory.find(c => c.category.toUpperCase() === target);
  };

  return {
    completeness: query.data,
    canOrder: query.data?.canOrder ?? false,
    hasMeasurement: query.data?.hasMeasurement ?? false,
    byCategory: query.data?.byCategory ?? [],
    getCategoryCompleteness,
    isLoading: status === 'loading' || query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
