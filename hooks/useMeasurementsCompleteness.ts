'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

export interface MissingMeasurementField {
  field: string;
  label: string;
}

export interface MeasurementCategoryCompleteness {
  category: 'UPPER' | 'LOWER' | 'FULL_BODY' | string;
  complete: boolean;
  requiredFields: string[];
  missingFields: string[];
  missing: MissingMeasurementField[];
}

export interface MeasurementsCompletenessResponse {
  canOrder: boolean;
  hasMeasurement: boolean;
  byCategory: MeasurementCategoryCompleteness[];
}

export function useMeasurementsCompleteness() {
  const { status } = useSession();

  const query = useQuery<MeasurementsCompletenessResponse>({
    queryKey: ['measurements-completeness'],
    queryFn: async () => {
      const res = await api.get('/users/me/measurements/completeness');
      return res.data;
    },
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
