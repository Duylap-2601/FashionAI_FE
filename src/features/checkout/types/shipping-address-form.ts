import React from 'react';
import type { GhnLocationOption, GhnWardOption } from '@/features/checkout/services/ghn-location';

export interface ShippingAddressFormProps {
  fullName: string;
  setFullName: React.Dispatch<React.SetStateAction<string>>;
  phone: string;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  addressDetail: string;
  setAddressDetail: React.Dispatch<React.SetStateAction<string>>;
  provinceId: number | '';
  setProvinceId: React.Dispatch<React.SetStateAction<number | ''>>;
  provinces: GhnLocationOption[];
  isLoadingProvinces: boolean;
  districtId: number | '';
  setDistrictId: React.Dispatch<React.SetStateAction<number | ''>>;
  districts: GhnLocationOption[];
  isLoadingDistricts: boolean;
  wardCode: string;
  setWardCode: React.Dispatch<React.SetStateAction<string>>;
  wards: GhnWardOption[];
  isLoadingWards: boolean;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
}
