import { api } from '@/lib/api';

export interface GhnLocationOption {
  id: number;
  name: string;
}

interface GhnProvinceWithWards extends GhnLocationOption {
  wards: GhnLocationOption[];
}

let locationsCache: GhnProvinceWithWards[] | null = null;

async function getGhnLocations(): Promise<GhnProvinceWithWards[]> {
  if (locationsCache) return locationsCache;

  const res = await api.get<GhnProvinceWithWards[]>('/shipping/locations');
  locationsCache = res.data;
  return locationsCache;
}

export async function getGhnProvinces(): Promise<GhnLocationOption[]> {
  const locations = await getGhnLocations();
  return locations.map(({ id, name }) => ({ id, name }));
}

export async function getGhnWards(provinceId: number): Promise<GhnLocationOption[]> {
  const locations = await getGhnLocations();
  return locations.find((province) => province.id === provinceId)?.wards ?? [];
}
