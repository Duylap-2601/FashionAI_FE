import { api } from '@/lib/api';

export interface GhnLocationOption {
  id: number;
  name: string;
}

export interface GhnWardOption {
  code: string;
  name: string;
}

function getNumber(value: unknown, keys: string[]) {
  if (!value || typeof value !== 'object') return 0;
  const record = value as Record<string, unknown>;
  for (const key of keys) {
    const raw = record[key];
    const parsed = typeof raw === 'number' ? raw : Number(raw);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return 0;
}

function getString(value: unknown, keys: string[]) {
  if (!value || typeof value !== 'object') return '';
  const record = value as Record<string, unknown>;
  for (const key of keys) {
    const raw = record[key];
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
    if (typeof raw === 'number') return String(raw);
  }
  return '';
}

function normalizeProvinceOption(value: unknown): GhnLocationOption | null {
  const id = getNumber(value, ['ProvinceID', 'province_id', 'id']);
  const name = getString(value, ['ProvinceName', 'name']);
  return id && name ? { id, name } : null;
}

function normalizeDistrictOption(value: unknown): GhnLocationOption | null {
  const id = getNumber(value, ['DistrictID', 'district_id', 'id']);
  const name = getString(value, ['DistrictName', 'name']);
  return id && name ? { id, name } : null;
}

function normalizeWardOption(value: unknown): GhnWardOption | null {
  const code = getString(value, ['code', 'WardCode', 'ward_code', '_id', 'id']);
  const name = getString(value, ['name', 'WardName']);
  return code && name ? { code, name } : null;
}

function normalizeList<T>(data: unknown, mapper: (value: unknown) => T | null) {
  const list = Array.isArray(data) ? data : [];
  return list.map(mapper).filter((item): item is T => Boolean(item));
}

export async function getGhnProvinces(signal?: AbortSignal): Promise<GhnLocationOption[]> {
  const res = await api.get<unknown[]>('/shipping/provinces', { signal });
  return normalizeList(res.data, normalizeProvinceOption);
}

export async function getGhnDistricts(provinceId: number, signal?: AbortSignal): Promise<GhnLocationOption[]> {
  const res = await api.get<unknown[]>('/shipping/districts', { params: { provinceId }, signal });
  return normalizeList(res.data, normalizeDistrictOption);
}

export async function getGhnWards(districtId: number, signal?: AbortSignal): Promise<GhnWardOption[]> {
  const res = await api.get<unknown[]>('/shipping/wards', { params: { districtId }, signal });
  return normalizeList(res.data, normalizeWardOption);
}
