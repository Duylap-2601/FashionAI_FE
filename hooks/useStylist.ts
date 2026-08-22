'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

export interface StylistAnalysisRequest {
  humanImage: File;
  productId?: string;
  garmentDescription?: string;
  occasion?: string;
  stylePreference?: string;
  budget?: string;
  genderPreference?: 'male' | 'female' | 'other';
}

export interface OutfitItem {
  type: string;
  name: string;
}

export interface OutfitCombination {
  name: string;
  items: OutfitItem[];
}

export interface StylistProduct {
  id: string;
  name: string;
  price?: string | number | null;
  garmentUrl?: string;
  images?: { imageUrl: string; isMain: boolean }[];
  color?: string | null;
  size?: string | null;
  description?: string | null;
}

export interface StylistAnalysisResult {
  bodyType: string;
  skinTone: string;
  personalColor: string;
  fitRecommendation: string;
  recommendedSize?: string | null;
  productCompatibilityScore?: number | null;
  colorSuggestions: string[] | { name: string; hex: string }[];
  outfitCombinations: OutfitCombination[] | string[];
  stylingTips: string;
  verdict: string;
}

export interface StylistResult extends Partial<StylistAnalysisResult> {
  id: string;
  humanImageUrl?: string;
  garmentDescription?: string;
  analysisResult?: StylistAnalysisResult;
  createdAt: string;
  occasion?: string;
  stylePreference?: string;
  budget?: string;
  genderPreference?: string;
  recommendedSize?: string | null;
  productCompatibilityScore?: number | null;
  product?: StylistProduct | null;
  model?: string;
}

export interface StylistHistoryMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function extractErrorMessage(error: unknown): string {
  if (!error) return 'Không xác định được lỗi.';
  const anyError = error as any;
  if (anyError?.response?.data?.message) {
    const message = anyError.response.data.message;
    return Array.isArray(message) ? message[0] : message;
  }
  if (anyError?.response?.data?.error) return anyError.response.data.error;
  if (anyError?.message) return anyError.message;
  return 'Đã xảy ra lỗi không xác định.';
}

function buildFormData(payload: StylistAnalysisRequest): FormData {
  const formData = new FormData();
  formData.append('humanImage', payload.humanImage);
  if (payload.productId) formData.append('productId', payload.productId);
  if (payload.garmentDescription) formData.append('garmentDescription', payload.garmentDescription);
  if (payload.occasion) formData.append('occasion', payload.occasion);
  if (payload.stylePreference) formData.append('stylePreference', payload.stylePreference);
  if (payload.budget) formData.append('budget', payload.budget);
  if (payload.genderPreference) formData.append('genderPreference', payload.genderPreference);
  return formData;
}

export function useAnalyzeStylist() {
  const queryClient = useQueryClient();

  const analyzeMutation = useMutation({
    mutationFn: async (payload: StylistAnalysisRequest) => {
      const formData = buildFormData(payload);

      const res = await api.post('/stylist/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 90000,
      });
      return normalizeStylistResult(res.data as StylistResult);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stylist-history'] });
      queryClient.invalidateQueries({ queryKey: ['quota', 'STYLIST'] });
    },
  });

  return {
    analyze: analyzeMutation.mutate,
    analyzeAsync: analyzeMutation.mutateAsync,
    isAnalyzing: analyzeMutation.isPending,
    error: analyzeMutation.error,
    errorMessage: analyzeMutation.error
      ? extractErrorMessage(analyzeMutation.error)
      : null,
    reset: analyzeMutation.reset,
  };
}

export function useStylistHistory(page = 1, pageSize = 20) {
  const { status } = useSession();
  const query = useQuery<{ items: StylistResult[]; meta: StylistHistoryMeta }>({
    queryKey: ['stylist-history', page, pageSize],
    queryFn: async () => {
      const res = await api.get('/stylist/history', {
        params: { page, limit: pageSize },
      });
      const items = ((res.data || []) as StylistResult[]).map(normalizeStylistResult);
      const meta = (res.data as any)?.__meta ?? {
        total: items.length,
        page,
        limit: pageSize,
        totalPages: 1,
      };
      return { items, meta };
    },
    enabled: status === 'authenticated',
  });

  return {
    history: query.data?.items || [],
    meta: query.data?.meta,
    isLoading: status === 'loading' || query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useDeleteStylistHistory() {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/stylist/history/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stylist-history'] });
    },
  });

  return {
    deleteHistoryItem: deleteMutation.mutate,
    deleteAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

function normalizeStylistResult(result: StylistResult): StylistResult {
  return {
    ...result,
    ...(result.analysisResult ?? {}),
  };
}
