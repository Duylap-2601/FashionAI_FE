import { http } from '@/lib/http';

export interface GhnCatalogOption {
  id: string;
  name: string;
  aliases?: string[];
  catalogRevision: string;
}

export interface ShippingCapabilities {
  catalogRevision: string | null;
  catalogEnabled: boolean;
  newAddressWriteEnabled: boolean;
  newAddressCheckoutEnabled: boolean;
}

export async function getShippingCapabilities(signal?: AbortSignal): Promise<ShippingCapabilities> {
  return http.get<ShippingCapabilities>('/shipping/capabilities', { signal });
}

export async function getPostMergerProvinces(revision: string, signal?: AbortSignal): Promise<GhnCatalogOption[]> {
  return http.get<GhnCatalogOption[]>('/shipping/address-catalog/provinces', {
    params: { revision },
    signal,
  });
}

export async function getPostMergerWards(provinceId: string, revision: string, signal?: AbortSignal): Promise<GhnCatalogOption[]> {
  return http.get<GhnCatalogOption[]>('/shipping/address-catalog/wards', {
    params: { provinceId, revision },
    signal,
  });
}
