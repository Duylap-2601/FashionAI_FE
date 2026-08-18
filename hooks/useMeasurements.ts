'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface UserMeasurements {
  height?: number;
  weight?: number;
  chest?: number;
  waist?: number;
  hip?: number;
  shoulder?: number;
  // Advanced fields (from UI prototype)
  neck?: number;
  underbust?: number;
  bodyLength?: number;
  sleeveLength?: number;
  wrist?: number;
  thigh?: number;
  inseam?: number;
  knee?: number;
  calf?: number;
  trouserLength?: number;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  birthday?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  job?: string;
  company?: string;
}

export function useMeasurements() {
  const queryClient = useQueryClient();

  const measurementsQuery = useQuery<UserMeasurements>({
    queryKey: ['measurements'],
    queryFn: async () => {
      const res = await api.get('/users/me/measurements');
      return res.data || {};
    },
  });

  const updateMeasurementsMutation = useMutation({
    mutationFn: async (measurements: UserMeasurements) => {
      const res = await api.put('/users/me/measurements', measurements);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['measurements'], data);
    },
  });

  return {
    measurements: measurementsQuery.data,
    isLoading: measurementsQuery.isLoading,
    isError: measurementsQuery.isError,
    updateMeasurements: updateMeasurementsMutation.mutate,
    isUpdating: updateMeasurementsMutation.isPending,
  };
}

export function useUserProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/users/me');
      return res.data || {};
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profile: Partial<UserProfile>) => {
      const res = await api.put('/users/me', profile);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  };
}

export function useChangePassword() {
  const changeMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      // Endpoint: POST /auth/change-password (per Swagger UI)
      const res = await api.post('/auth/change-password', { currentPassword, newPassword });
      return res.data;
    },
  });

  return {
    changePassword: changeMutation.mutateAsync,
    isChanging: changeMutation.isPending,
    error: changeMutation.error,
  };
}
