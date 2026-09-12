export const queryKeys = {
  ghnProvinces: () => ['checkout', 'ghn', 'legacy-v2', 'provinces'] as const,
  ghnDistricts: (provinceId?: number | '') => ['checkout', 'ghn', 'legacy-v2', 'districts', provinceId] as const,
  ghnWards: (districtId?: number | '') => ['checkout', 'ghn', 'legacy-v2', 'wards', districtId] as const,
};
