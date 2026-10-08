export interface UserAddress {
  id: string;
  ghnAddressModel?: 'LEGACY_3_LEVEL' | 'POST_MERGER_2_LEVEL';
  addressModel?: 'LEGACY_3_LEVEL' | 'POST_MERGER_2_LEVEL';
  recipientName: string;
  phone: string;
  addressLine: string;
  label?: string | null;
  ghnProvinceId?: number | null;
  ghnDistrictId?: number | null;
  ghnWardCode?: string | null;
  ghnProvinceV3Id?: string | null;
  ghnWardV3Id?: string | null;
  provinceName: string;
  districtName?: string | null;
  wardName: string;
  isDefault: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddressInput {
  addressModel?: 'LEGACY_3_LEVEL' | 'POST_MERGER_2_LEVEL';
  recipientName: string;
  phone: string;
  addressLine: string;
  label?: string;
  ghnProvinceId?: number;
  ghnDistrictId?: number;
  ghnWardCode?: string;
  ghnProvinceV3Id?: string;
  ghnWardV3Id?: string;
  isDefault?: boolean;
  expectedVersion?: number;
}
