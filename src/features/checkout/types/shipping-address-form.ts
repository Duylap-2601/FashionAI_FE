import React from 'react';
import type { GhnCatalogOption } from '@/features/checkout/services/ghn-location';

export interface ShippingAddressFormProps {
  fullName: string;
  setFullName: React.Dispatch<React.SetStateAction<string>>;
  phone: string;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  addressDetail: string;
  setAddressDetail: React.Dispatch<React.SetStateAction<string>>;
  provinceId: string;
  setProvinceId: React.Dispatch<React.SetStateAction<string>>;
  provinces: GhnCatalogOption[];
  isLoadingProvinces: boolean;
  wardId: string;
  setWardId: React.Dispatch<React.SetStateAction<string>>;
  wards: GhnCatalogOption[];
  isLoadingWards: boolean;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
}
