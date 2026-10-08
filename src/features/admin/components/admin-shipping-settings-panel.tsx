'use client';

import { updateGhnPickupSettings } from '@/features/admin/services/mutations';
import { fetchGhnPickupSettings } from '@/features/admin/services/queries';
import type { GhnPickupSettings } from '@/features/admin/types/admin-dashboard-page';
import { getPostMergerProvinces, getPostMergerWards, getShippingCapabilities } from '@/features/checkout/services/ghn-location';
import type { GhnCatalogOption } from '@/features/checkout/services/ghn-location';
import { getErrorMessage } from '@/lib/errors';
import { MapPin, Save, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

function unwrapData<T>(value: unknown): T | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as { data?: unknown };
  const maybeEnvelope = 'data' in record ? record.data : value;
  if (maybeEnvelope && typeof maybeEnvelope === 'object' && 'data' in maybeEnvelope) {
    return (maybeEnvelope as { data: T }).data;
  }
  return maybeEnvelope as T;
}

function isAbortError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const record = error as { name?: string; code?: string };
  return record.name === 'CanceledError' || record.name === 'AbortError' || record.code === 'ERR_CANCELED';
}

export function AdminShippingSettingsPanel() {
  const [settings, setSettings] = useState<GhnPickupSettings | null>(null);
  const [catalogRevision, setCatalogRevision] = useState('');
  const [provinces, setProvinces] = useState<GhnCatalogOption[]>([]);
  const [wards, setWards] = useState<GhnCatalogOption[]>([]);
  const [provinceId, setProvinceId] = useState('');
  const [wardId, setWardId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isLoadingLocation = isLoading || isLoadingProvinces || isLoadingWards;

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    async function loadInitialData() {
      setIsLoading(true);
      setIsLoadingProvinces(true);
      try {
        const [settingsRes, capability] = await Promise.all([fetchGhnPickupSettings(), getShippingCapabilities(controller.signal)]);
        if (!capability.catalogEnabled || !capability.catalogRevision) throw new Error('Danh mục địa chỉ GHN sau sáp nhập chưa sẵn sàng.');
        const provinceList = await getPostMergerProvinces(capability.catalogRevision, controller.signal);
        if (!mounted) return;
        const currentSettings = unwrapData<GhnPickupSettings>(settingsRes) || { source: 'empty' };
        setCatalogRevision(capability.catalogRevision);
        setSettings(currentSettings);
        setProvinces(provinceList);
        setProvinceId(currentSettings.provinceV3Id || provinceList[0]?.id || '');
        setWardId(currentSettings.wardV3Id || '');
      } catch (error: unknown) {
        if (isAbortError(error)) return;
        toast.error(getErrorMessage(error, 'Không thể tải cấu hình GHN.'));
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsLoadingProvinces(false);
        }
      }
    }
    loadInitialData();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    async function loadWards() {
      if (!provinceId || !catalogRevision) {
        setWards([]);
        setWardId('');
        return;
      }
      setIsLoadingWards(true);
      try {
        const list = await getPostMergerWards(provinceId, catalogRevision, controller.signal);
        if (!mounted) return;
        setWards(list);
        setWardId((current) => current && list.some((item) => item.id === current) ? current : list[0]?.id || '');
      } finally {
        if (mounted) setIsLoadingWards(false);
      }
    }
    loadWards().catch((error: unknown) => {
      if (isAbortError(error)) return;
      toast.error(getErrorMessage(error, 'Không thể tải Phường/Xã GHN.'));
    });
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [provinceId, catalogRevision]);

  const handleSave = async () => {
    if (!provinceId || !wardId) {
      toast.error('Vui lòng chọn đủ Tỉnh/Thành và Phường/Xã lấy hàng.');
      return;
    }
    setIsSaving(true);
    try {
      const res = await updateGhnPickupSettings({ addressModel: 'POST_MERGER_2_LEVEL', provinceV3Id: provinceId, wardV3Id: wardId });
      const updated = unwrapData<GhnPickupSettings>(res) || { addressModel: 'POST_MERGER_2_LEVEL', provinceV3Id: provinceId, wardV3Id: wardId, source: 'database' };
      setSettings(updated);
      toast.success('Đã lưu cấu hình lấy hàng GHN');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Không thể lưu cấu hình GHN.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[900px]">
      <div>
        <h1 className="text-heading-h2 font-bold text-neutral-900">Cài đặt giao hàng GHN</h1>
        <p className="text-body-sm text-neutral-500 mt-1">Cấu hình địa chỉ lấy hàng dùng để tính phí vận chuyển và tạo vận đơn.</p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
          <Truck className="w-4 h-4 text-brand-navy" />
          <h2 className="text-body-sm font-bold text-neutral-800">Địa chỉ lấy hàng</h2>
          <span className="ml-auto text-label-xs text-neutral-400">
            Nguồn: {settings?.source === 'database' ? 'Admin setting' : settings?.source === 'env' ? '.env fallback' : 'Chưa cấu hình'}
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-body-sm font-medium text-brand-navy mb-1.5">Tỉnh/Thành phố *</label>
            <select
              value={provinceId}
              onChange={(event) => { setProvinceId(event.target.value); setWardId(''); }}
              disabled={isLoadingProvinces || provinces.length === 0}
              className="w-full h-[48px] px-4 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-all disabled:bg-neutral-50"
            >
              {isLoadingProvinces && <option value="">Đang tải Tỉnh/Thành...</option>}
              {!isLoadingProvinces && provinces.length === 0 && <option value="">Không có dữ liệu Tỉnh/Thành</option>}
              {provinces.map((province) => <option key={province.id} value={province.id}>{province.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-body-sm font-medium text-brand-navy mb-1.5">Phường/Xã *</label>
            <select
              value={wardId}
              onChange={(event) => setWardId(event.target.value)}
              disabled={isLoadingWards || wards.length === 0}
              className="w-full h-[48px] px-4 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-all disabled:bg-neutral-50"
            >
              {isLoadingWards && <option value="">Đang tải Phường/Xã...</option>}
              {!isLoadingWards && wards.length === 0 && <option value="">Không có dữ liệu Phường/Xã</option>}
              {wards.map((ward) => <option key={ward.id} value={ward.id}>{ward.name}</option>)}
            </select>
          </div>
        </div>

        <div className="px-6 pb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-label-sm text-neutral-500">
            <MapPin className="w-4 h-4" />
            <span>Lưu cấu hình lấy hàng theo địa chỉ hành chính sau sáp nhập.</span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoadingLocation}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-brand-navy text-white text-body-sm font-bold hover:bg-brand-navy/90 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}
