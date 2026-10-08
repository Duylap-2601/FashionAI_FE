export const queryKeys = {
  ghnProvinces: () => ['checkout', 'ghn', 'legacy-v2', 'provinces'] as const,
  ghnDistricts: (provinceId?: number | '') => ['checkout', 'ghn', 'legacy-v2', 'districts', provinceId] as const,
  ghnWards: (districtId?: number | '') => ['checkout', 'ghn', 'legacy-v2', 'wards', districtId] as const,
  shippingCapabilities: () => ['checkout', 'ghn', 'capabilities'] as const,
  postMergerProvinces: (revision?: string) => ['checkout', 'ghn', 'post-merger', 'provinces', revision] as const,
  postMergerWards: (provinceId?: string, revision?: string) => ['checkout', 'ghn', 'post-merger', 'wards', provinceId, revision] as const,
};
