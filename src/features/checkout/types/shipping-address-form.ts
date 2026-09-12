import React from 'react';
import type { GhnLocationOption } from '@/features/checkout/services/ghn-location';

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
  wardId: number | '';
  setWardId: React.Dispatch<React.SetStateAction<number | ''>>;
  wards: GhnLocationOption[];
  isLoadingWards: boolean;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
}
