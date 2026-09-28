export interface UserAddress {
  id: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  label?: string | null;
  ghnProvinceId: number;
  ghnDistrictId: number;
  ghnWardCode: string;
  provinceName: string;
  districtName: string;
  wardName: string;
  isDefault: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddressInput {
  recipientName: string;
  phone: string;
  addressLine: string;
  label?: string;
  ghnProvinceId: number;
  ghnDistrictId: number;
  ghnWardCode: string;
  isDefault?: boolean;
  expectedVersion?: number;
}
