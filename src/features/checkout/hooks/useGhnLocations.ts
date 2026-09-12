'use client';

import { getGhnDistricts, getGhnProvinces, getGhnWards } from '@/features/checkout/services/ghn-location';
import { queryKeys as checkoutQueryKeys } from '@/features/checkout/services/query-keys';
import { useQuery } from '@tanstack/react-query';

const GHN_LOCATION_STALE_TIME = 24 * 60 * 60 * 1000;
const GHN_LOCATION_GC_TIME = 7 * 24 * 60 * 60 * 1000;

export function useGhnProvinces() {
  const query = useQuery({
    queryKey: checkoutQueryKeys.ghnProvinces(),
    queryFn: ({ signal }) => getGhnProvinces(signal),
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

export function useGhnDistricts(provinceId: number | '') {
  const query = useQuery({
    queryKey: checkoutQueryKeys.ghnDistricts(provinceId),
    queryFn: ({ signal }) => getGhnDistricts(Number(provinceId), signal),
    enabled: Boolean(provinceId),
    staleTime: GHN_LOCATION_STALE_TIME,
    gcTime: GHN_LOCATION_GC_TIME,
  });

  return {
    districts: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useGhnWards(districtId: number | '') {
  const query = useQuery({
    queryKey: checkoutQueryKeys.ghnWards(districtId),
    queryFn: ({ signal }) => getGhnWards(Number(districtId), signal),
    enabled: Boolean(districtId),
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
