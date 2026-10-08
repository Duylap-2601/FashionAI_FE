export const queryKeys = {
  shippingCapabilities: () => ['checkout', 'ghn', 'capabilities'] as const,
  postMergerProvinces: (revision?: string) => ['checkout', 'ghn', 'post-merger', 'provinces', revision] as const,
  postMergerWards: (provinceId?: string, revision?: string) => ['checkout', 'ghn', 'post-merger', 'wards', provinceId, revision] as const,
};
