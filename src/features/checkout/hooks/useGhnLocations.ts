'use client';

import { getPostMergerProvinces, getPostMergerWards, getShippingCapabilities } from '@/features/checkout/services/ghn-location';
import { queryKeys as checkoutQueryKeys } from '@/features/checkout/services/query-keys';
import { useQuery } from '@tanstack/react-query';

const GHN_LOCATION_STALE_TIME = 24 * 60 * 60 * 1000;
const GHN_LOCATION_GC_TIME = 7 * 24 * 60 * 60 * 1000;
const GHN_CAPABILITY_STALE_TIME = 60 * 1000;

export function useShippingCapabilities() {
  const query = useQuery({
    queryKey: checkoutQueryKeys.shippingCapabilities(),
    queryFn: ({ signal }) => getShippingCapabilities(signal),
    staleTime: GHN_CAPABILITY_STALE_TIME,
    gcTime: GHN_LOCATION_GC_TIME,
  });

  return {
    capability: query.data,
    catalogRevision: query.data?.catalogRevision ?? '',
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function usePostMergerProvinces(revision: string) {
  const query = useQuery({
    queryKey: checkoutQueryKeys.postMergerProvinces(revision),
    queryFn: ({ signal }) => getPostMergerProvinces(revision, signal),
    enabled: Boolean(revision),
    staleTime: GHN_LOCATION_STALE_TIME,
    gcTime: GHN_LOCATION_GC_TIME,
  });

  return {
    provinces: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function usePostMergerWards(provinceId: string, revision: string) {
  const query = useQuery({
    queryKey: checkoutQueryKeys.postMergerWards(provinceId, revision),
    queryFn: ({ signal }) => getPostMergerWards(provinceId, revision, signal),
    enabled: Boolean(provinceId && revision),
    staleTime: GHN_LOCATION_STALE_TIME,
    gcTime: GHN_LOCATION_GC_TIME,
  });

  return {
    wards: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

