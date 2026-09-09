import React from 'react';

export interface ShippingAddressFormProps {
  fullName: string;
  setFullName: React.Dispatch<React.SetStateAction<string>>;
  phone: string;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  addressDetail: string;
  setAddressDetail: React.Dispatch<React.SetStateAction<string>>;
  provinceId: string;
  setProvinceId: React.Dispatch<React.SetStateAction<string>>;
  setDistrictId: React.Dispatch<React.SetStateAction<string>>;
  districtId: string;
  availableDistricts: import("@/features/checkout/types/vietnam-provinces").District[];
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
}
