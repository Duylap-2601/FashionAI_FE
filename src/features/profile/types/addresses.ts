export interface UserAddress {
  id: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  label?: string | null;
  ghnProvinceV3Id: string;
  ghnWardV3Id: string;
  provinceName: string;
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
  ghnProvinceV3Id: string;
  ghnWardV3Id: string;
  isDefault?: boolean;
  expectedVersion?: number;
}
