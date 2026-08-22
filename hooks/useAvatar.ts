'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { GenerateAvatarDto, AvatarResult } from '@/types/avatar';

export function resolveGlbUrl(glbUrl?: string | null): string | undefined {
  if (!glbUrl) return undefined;
  if (glbUrl.startsWith('http://') || glbUrl.startsWith('https://') || glbUrl.startsWith('blob:')) {
    return glbUrl;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
  const cleanBase = apiBase.replace(/\/api\/?$/, '').replace(/\/$/, '');
  const cleanPath = glbUrl.startsWith('/') ? glbUrl : `/${glbUrl}`;
  
  if (cleanPath.startsWith('/api/')) {
    return `${cleanBase}${cleanPath}`;
  }
  return `${cleanBase}/api${cleanPath}`;
}

export function useGenerateAvatar() {
  const queryClient = useQueryClient();

  const mutation = useMutation<AvatarResult, Error, GenerateAvatarDto>({
    mutationFn: async (dto: GenerateAvatarDto) => {
      const res = await api.post('/avatar/generate', dto, {
        timeout: 60000, // 60s timeout for blender generation
      });
      return res.data as AvatarResult;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['my-avatar'], data);
      queryClient.invalidateQueries({ queryKey: ['my-avatar'] });
    },
  });

  return {
    generateAvatar: mutation.mutate,
    generateAvatarAsync: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
    data: mutation.data,
  };
}

export function useMyAvatar() {
  const { status } = useSession();
  const query = useQuery<AvatarResult | null>({
    queryKey: ['my-avatar'],
    queryFn: async () => {
      try {
        const res = await api.get('/avatar/me');
        return (res.data || null) as AvatarResult | null;
      } catch (err: any) {
        if (err?.response?.status === 401 || err?.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: status === 'authenticated',
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  return {
    avatar: query.data,
    isLoading: status === 'loading' || query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useAvatarById(id?: string) {
  const query = useQuery<AvatarResult | null>({
    queryKey: ['avatar', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await api.get(`/avatar/${id}`);
      return (res.data || null) as AvatarResult | null;
    },
    enabled: !!id,
  });

  return {
    avatar: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
