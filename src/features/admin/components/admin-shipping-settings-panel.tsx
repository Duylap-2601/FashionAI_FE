'use client';

import { syncGhnLocations, updateGhnPickupSettings } from '@/features/admin/services/mutations';
import { fetchGhnPickupSettings } from '@/features/admin/services/queries';
import { AdminLoadingBar, AdminPanelLoading } from '@/features/admin/components/admin-loading';
import type { GhnPickupSettings } from '@/features/admin/types/admin-dashboard-page';
import { getPostMergerProvinces, getPostMergerWards, getShippingCapabilities } from '@/features/checkout/services/ghn-location';
import type { GhnCatalogOption } from '@/features/checkout/services/ghn-location';
import { getErrorMessage } from '@/lib/errors';
import { AlertCircle, MapPin, RefreshCw, Save, Truck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
  const [addressLine, setAddressLine] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isLoadingLocation = isLoading || isLoadingProvinces || isLoadingWards;

  const loadInitialData = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setIsLoadingProvinces(true);
    setLoadError(null);
    try {
      const [settingsRes, capability] = await Promise.all([fetchGhnPickupSettings(), getShippingCapabilities(signal)]);
      if (!capability.catalogEnabled || !capability.catalogRevision) {
        throw new Error('Danh mục địa chỉ GHN sau sáp nhập chưa sẵn sàng.');
      }
      const provinceList = await getPostMergerProvinces(capability.catalogRevision, signal);
      const currentSettings = unwrapData<GhnPickupSettings>(settingsRes) || { source: 'empty' };
      setCatalogRevision(capability.catalogRevision);
      setSettings(currentSettings);
      setProvinces(provinceList);
      setProvinceId(currentSettings.provinceV3Id || '');
      setWardId(currentSettings.wardV3Id || '');
      setAddressLine(currentSettings.addressLine || '');
    } catch (error: unknown) {
      if (isAbortError(error)) return;
      const msg = getErrorMessage(error, 'Không thể tải cấu hình GHN.');
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
      setIsLoadingProvinces(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadInitialData(controller.signal);
    return () => {
      controller.abort();
    };
  }, [loadInitialData]);

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
        setWardId((current) => current && list.some((item) => item.id === current) ? current : '');
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

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncGhnLocations();
      toast.success('Đã đồng bộ danh mục địa chỉ GHN thành công!');
      await loadInitialData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Đồng bộ danh mục GHN thất bại.'));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = async () => {
    if (!provinceId || !wardId) {
      toast.error('Vui lòng chọn đủ Tỉnh/Thành và Phường/Xã lấy hàng.');
      return;
    }
    if (!addressLine.trim()) {
      toast.error('Vui lòng nhập số nhà, tên đường lấy hàng.');
      return;
    }
    setIsSaving(true);
    try {
      const res = await updateGhnPickupSettings({ provinceV3Id: provinceId, wardV3Id: wardId, addressLine: addressLine.trim() });
      const updated = unwrapData<GhnPickupSettings>(res) || { provinceV3Id: provinceId, wardV3Id: wardId, addressLine: addressLine.trim(), source: 'database' };
      setSettings(updated);
      toast.success('Đã lưu cấu hình lấy hàng GHN');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Không thể lưu cấu hình GHN.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !settings) {
    return <AdminPanelLoading label="Đang tải cấu hình GHN" />;
  }

  return (
    <div className="flex flex-col gap-6 max-w-[900px]">
      <div>
        <h1 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.08] tracking-[-0.025em] text-landing-obsidian">Cài đặt giao hàng GHN</h1>
        <p className="text-body-sm text-landing-muted mt-1">Cấu hình địa chỉ lấy hàng dùng để tính phí vận chuyển và tạo vận đơn.</p>
      </div>

      {(isLoading || isLoadingWards) && (
        <AdminLoadingBar
          label={isLoadingWards ? 'Đang tải Phường/Xã...' : 'Đang tải cấu hình GHN...'}
        />
      )}

      <div className="bg-landing-ivory rounded-[2px] border border-landing-line overflow-hidden">
        <div className="px-6 py-4 border-b border-landing-line flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-landing-oxblood" />
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-brass-ink">Địa chỉ lấy hàng</h2>
            <span className="ml-2 text-label-xs text-landing-muted">
              Nguồn: {settings?.source === 'database' ? 'Admin setting' : 'Chưa cấu hình'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing || isLoading}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[2px] border border-landing-line text-xs font-semibold text-landing-obsidian hover:bg-landing-paper/60 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ danh mục GHN'}
          </button>
        </div>

        {loadError && (
          <div className="mx-6 mt-4 p-4 rounded-[2px] border border-metric-users/30 bg-metric-users/10 text-xs text-metric-users flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-metric-users shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-metric-users">Danh mục địa chỉ GHN chưa sẵn sàng hoặc đã hết hiệu lực</p>
              <p className="mt-0.5 text-metric-users">{loadError}</p>
              <p className="mt-1 text-metric-users">
                Bấm nút <strong>&quot;Đồng bộ danh mục GHN&quot;</strong> ở góc trên bên phải để cập nhật dữ liệu mới nhất từ GHN.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSync}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-[2px] bg-metric-users text-landing-paper font-semibold shrink-0 hover:bg-landing-obsidian disabled:opacity-50 transition-colors"
            >
              {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}
            </button>
          </div>
        )}

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-body-sm font-medium text-landing-oxblood mb-1.5">Tỉnh/Thành phố *</label>
            <select
              value={provinceId}
              onChange={(event) => { setProvinceId(event.target.value); setWardId(''); }}
              disabled={isLoadingProvinces || provinces.length === 0}
              className="w-full h-[48px] px-4 rounded-[2px] border border-landing-line bg-landing-ivory focus:outline-none focus:border-landing-oxblood focus:ring-1 focus:ring-landing-oxblood transition-all disabled:bg-landing-paper/60"
            >
              {isLoadingProvinces && <option value="">Đang tải Tỉnh/Thành...</option>}
              {!isLoadingProvinces && provinces.length === 0 && <option value="">Không có dữ liệu Tỉnh/Thành</option>}
              {provinces.map((province) => <option key={province.id} value={province.id}>{province.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-body-sm font-medium text-landing-oxblood mb-1.5">Phường/Xã *</label>
            <select
              value={wardId}
              onChange={(event) => setWardId(event.target.value)}
              disabled={isLoadingWards || wards.length === 0}
              className="w-full h-[48px] px-4 rounded-[2px] border border-landing-line bg-landing-ivory focus:outline-none focus:border-landing-oxblood focus:ring-1 focus:ring-landing-oxblood transition-all disabled:bg-landing-paper/60"
            >
              {isLoadingWards && <option value="">Đang tải Phường/Xã...</option>}
              {!isLoadingWards && wards.length === 0 && <option value="">Không có dữ liệu Phường/Xã</option>}
              {wards.map((ward) => <option key={ward.id} value={ward.id}>{ward.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-body-sm font-medium text-landing-oxblood mb-1.5">Số nhà, tên đường *</label>
            <input
              value={addressLine}
              onChange={(event) => setAddressLine(event.target.value)}
              placeholder="Ví dụ: Long Thạnh Mỹ"
              className="w-full h-[48px] px-4 rounded-[2px] border border-landing-line bg-landing-ivory focus:outline-none focus:border-landing-oxblood focus:ring-1 focus:ring-landing-oxblood transition-all"
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-label-sm text-landing-muted">
            <MapPin className="w-4 h-4" />
            <span>Lưu cấu hình lấy hàng theo địa chỉ hành chính sau sáp nhập.</span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoadingLocation}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[2px] bg-landing-oxblood text-landing-paper text-body-sm font-bold hover:bg-landing-oxblood/90 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}
