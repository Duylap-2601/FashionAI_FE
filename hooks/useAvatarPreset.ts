'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AvatarMeasurements, PresetNearest } from '@/types/avatar';

export interface UseAvatarPresetParams extends Partial<AvatarMeasurements> {
  gender?: 'male' | 'female';
  enabled?: boolean;
}

export function useAvatarPreset(params: UseAvatarPresetParams) {
  const {
    gender = 'female',
    height,
    weight,
    chest,
    waist,
    hip,
    shoulder,
    enabled = true,
  } = params;

  const isComplete = Boolean(
    gender &&
    height &&
    weight &&
    chest &&
    waist &&
    hip &&
    shoulder
  );

  const query = useQuery<PresetNearest | null>({
    queryKey: ['avatar-preset-nearest', gender, height, weight, chest, waist, hip, shoulder],
    queryFn: async () => {
      try {
        const res = await api.get('/avatar/presets/nearest', {
          params: {
            gender,
            height,
            weight,
            chest,
            waist,
            hip,
            shoulder,
          },
        });
        return (res.data || null) as PresetNearest | null;
      } catch (err: any) {
        // If endpoint is not ready or fails, log warning and return null to safely fallback
        console.warn('Avatar preset fetch failed, fallback to geometry/standard:', err?.message || err);
        return null;
      }
    },
    enabled: enabled && isComplete,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    presetData: query.data,
    isLoading: query.isLoading && isComplete,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
