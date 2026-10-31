'use client';

import { updateLiveTryOnSettings } from '@/features/admin/services/mutations';
import { fetchLiveTryOnSettings } from '@/features/admin/services/queries';
import type { GarmentCategory, LiveTryOnSettings, UpdateLiveTryOnSettingsInput, UserTier } from '@/features/admin/types/admin-dashboard-page';
import { getErrorMessage } from '@/lib/errors';
import { Activity, Gauge, Save, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const TIERS: UserTier[] = ['FREE', 'MEMBER', 'VIP'];
const CATEGORIES: GarmentCategory[] = ['UPPER', 'LOWER', 'FULL_BODY'];

function unwrapData<T>(value: unknown): T | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as { data?: unknown };
  if (!('data' in record)) return value as T;
  const maybeEnvelope = record.data;
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

export function AdminLiveTryOnSettingsPanel() {
  const [settings, setSettings] = useState<LiveTryOnSettings | null>(null);
  const [userAllowlist, setUserAllowlist] = useState('');
  const [productAllowlist, setProductAllowlist] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadSettings() {
      setIsLoading(true);
      try {
        const res = await fetchLiveTryOnSettings();
        if (!mounted) return;
        const next = unwrapData<LiveTryOnSettings>(res);
        if (!next) throw new Error('Không tìm thấy cấu hình Live Try-On.');
        setSettings(next);
        setUserAllowlist(next.betaUserIds.join('\n'));
        setProductAllowlist(next.betaProductIds.join('\n'));
      } catch (error: unknown) {
        if (isAbortError(error)) return;
        toast.error(getErrorMessage(error, 'Không thể tải cấu hình Live Try-On.'));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadSettings();
    return () => {
      mounted = false;
    };
  }, []);

  const updateRoot = <K extends keyof LiveTryOnSettings>(key: K, value: LiveTryOnSettings[K]) => {
    setSettings((current) => current ? { ...current, [key]: value } : current);
  };

  const updateTier = (tier: UserTier, key: keyof LiveTryOnSettings['tiers'][UserTier], value: boolean | number) => {
    setSettings((current) => current ? {
      ...current,
      tiers: {
        ...current.tiers,
        [tier]: {
          ...current.tiers[tier],
          [key]: value,
        },
      },
    } : current);
  };

  const toggleCategory = (category: GarmentCategory) => {
    setSettings((current) => {
      if (!current) return current;
      const exists = current.allowedCategories.includes(category);
      const allowedCategories = exists
        ? current.allowedCategories.filter((item) => item !== category)
        : [...current.allowedCategories, category];
      return { ...current, allowedCategories };
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    if (settings.allowedCategories.length === 0) {
      toast.error('Live Try-On cần ít nhất một category được bật.');
      return;
    }
    for (const tier of TIERS) {
      const policy = settings.tiers[tier];
      if (policy.liveEnabled && policy.maxSessionSeconds > policy.dailySeconds) {
        toast.error(`${tier}: thời gian tối đa mỗi phiên không được lớn hơn quota ngày.`);
        return;
      }
    }

    const payload: UpdateLiveTryOnSettingsInput = {
      enabled: settings.enabled,
      version: settings.version,
      globalDailyCredits: settings.globalDailyCredits,
      maxConcurrentSessions: settings.maxConcurrentSessions,
      pauseTimeoutSeconds: settings.pauseTimeoutSeconds,
      allowedCategories: settings.allowedCategories,
      betaUserIds: splitAllowlist(userAllowlist),
      betaProductIds: splitAllowlist(productAllowlist),
      tiers: settings.tiers,
      reason: reason.trim() || undefined,
    };

    setIsSaving(true);
    try {
      const res = await updateLiveTryOnSettings(payload);
      const updated = unwrapData<LiveTryOnSettings>(res) || { ...payload, source: 'database' };
      setSettings(updated);
      setUserAllowlist(updated.betaUserIds.join('\n'));
      setProductAllowlist(updated.betaProductIds.join('\n'));
      setReason('');
      toast.success('Đã lưu cấu hình Live Try-On');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Không thể lưu cấu hình Live Try-On.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="rounded-[2px] border border-landing-line bg-landing-ivory p-6 text-body-sm text-landing-muted">Đang tải cấu hình Live Try-On...</div>;
  }

  if (!settings) {
    return <div className="rounded-[2px] border border-destructive/30 bg-destructive/10 p-6 text-body-sm text-destructive">Không tải được cấu hình Live Try-On.</div>;
  }

  return (
    <div className="flex max-w-[1120px] flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.08] tracking-[-0.025em] text-landing-obsidian">Cài đặt Live Try-On</h1>
          <p className="mt-1 text-body-sm text-landing-muted">Điều khiển quyền dùng Decart Lucy theo gói, quota ngày và hành vi pause/resume.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-landing-line bg-landing-ivory px-4 py-2 text-label-sm text-landing-muted">
          <ShieldCheck className="h-4 w-4 text-metric-users" />
          Nguồn: <span className="font-bold text-landing-oxblood">{settings.source === 'database' ? 'Admin setting' : '.env fallback'}</span>
          <span className="text-landing-muted">/</span>
          v{settings.version}
        </div>
      </div>

      <section className="overflow-hidden rounded-[2px] border border-landing-line bg-landing-ivory">
        <div className="flex items-center gap-2 border-b border-landing-line px-6 py-4">
          <SlidersHorizontal className="h-4 w-4 text-landing-oxblood" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-brass-ink">Vận hành chung</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-4">
          <label className="flex min-h-[96px] flex-col justify-between rounded-[2px] border border-landing-line bg-landing-paper/60 p-4">
            <span className="text-body-sm font-bold text-landing-oxblood">Bật Live toàn hệ thống</span>
            <input type="checkbox" checked={settings.enabled} onChange={(event) => updateRoot('enabled', event.target.checked)} className="h-5 w-5 accent-landing-oxblood" />
          </label>
          <NumberField label="Global credits/ngày" value={settings.globalDailyCredits} min={0} onChange={(value) => updateRoot('globalDailyCredits', value)} />
          <NumberField label="Concurrent sessions" value={settings.maxConcurrentSessions} min={1} max={100} onChange={(value) => updateRoot('maxConcurrentSessions', value)} />
          <NumberField label="Pause timeout giây" value={settings.pauseTimeoutSeconds} min={15} max={86400} onChange={(value) => updateRoot('pauseTimeoutSeconds', value)} />
        </div>
      </section>

      <section className="overflow-hidden rounded-[2px] border border-landing-line bg-landing-ivory">
        <div className="flex items-center gap-2 border-b border-landing-line px-6 py-4">
          <Gauge className="h-4 w-4 text-landing-oxblood" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-brass-ink">Quota theo gói</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-3">
          {TIERS.map((tier) => {
            const policy = settings.tiers[tier];
            return (
              <div key={tier} className="rounded-[2px] border border-landing-line bg-landing-paper/60 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-landing-oxblood">Tier</p>
                    <h3 className="font-display text-[1.15rem] leading-tight text-landing-obsidian">{tier}</h3>
                  </div>
                  <label className="flex items-center gap-2 text-label-sm font-bold text-landing-obsidian">
                    <input type="checkbox" checked={policy.liveEnabled} onChange={(event) => updateTier(tier, 'liveEnabled', event.target.checked)} className="h-5 w-5 accent-landing-oxblood" />
                    Live
                  </label>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <NumberField label="Quota ngày (giây)" value={policy.dailySeconds} min={0} max={86400} onChange={(value) => updateTier(tier, 'dailySeconds', value)} />
                  <NumberField label="Tối đa/phiên (giây)" value={policy.maxSessionSeconds} min={0} max={3600} onChange={(value) => updateTier(tier, 'maxSessionSeconds', value)} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[5fr_7fr]">
        <div className="rounded-[2px] border border-landing-line bg-landing-ivory p-6">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-landing-oxblood" />
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-brass-ink">Category được phép</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`rounded-full border px-4 py-2 text-label-sm font-bold transition-colors ${settings.allowedCategories.includes(category) ? 'border-landing-oxblood bg-landing-oxblood text-landing-paper' : 'border-landing-line bg-landing-ivory text-landing-obsidian hover:bg-landing-paper/60'}`}
              >
                {category}
              </button>
            ))}
          </div>
          <p className="mt-4 text-body-sm text-landing-muted">Chỉ product catalog có `garmentUrl` và category được bật mới dùng được Live.</p>
        </div>

        <div className="rounded-[2px] border border-landing-line bg-landing-ivory p-6">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-brass-ink">Allowlist beta</h2>
          <p className="mt-1 text-body-sm text-landing-muted">Để trống nghĩa là không giới hạn. Nhập UUID, mỗi dòng hoặc phân tách bằng dấu phẩy.</p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextAreaField label="User IDs" value={userAllowlist} onChange={setUserAllowlist} />
            <TextAreaField label="Product IDs" value={productAllowlist} onChange={setProductAllowlist} />
          </div>
        </div>
      </section>

      <section className="rounded-[2px] border border-landing-line bg-landing-ivory p-6">
        <label className="block text-body-sm font-bold text-landing-oxblood">Lý do thay đổi</label>
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={2} placeholder="Ví dụ: mở VIP 300s/ngày cho beta tuần này" className="mt-2 w-full rounded-[2px] border border-landing-line bg-landing-ivory px-4 py-3 text-body-sm focus:border-landing-oxblood focus:outline-none focus:ring-1 focus:ring-landing-oxblood" />
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-body-sm text-landing-muted">Lưu sẽ tạo audit log trong backend. Phiên đang chạy giữ snapshot cũ; phiên mới dùng policy mới.</p>
          <button type="button" onClick={handleSave} disabled={isSaving} className="inline-flex h-11 items-center gap-2 rounded-[2px] bg-landing-oxblood px-5 text-body-sm font-bold text-landing-paper transition-colors hover:bg-landing-oxblood/90 disabled:opacity-50">
            <Save className="h-4 w-4" />
            {isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </button>
        </div>
      </section>
    </div>
  );
}

function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max?: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-body-sm font-medium text-landing-oxblood">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(Math.max(min, Number(event.target.value) || 0))}
        className="h-12 w-full rounded-[2px] border border-landing-line bg-landing-ivory px-4 text-body-sm focus:border-landing-oxblood focus:outline-none focus:ring-1 focus:ring-landing-oxblood"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-body-sm font-medium text-landing-oxblood">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={5} className="w-full rounded-[2px] border border-landing-line bg-landing-paper/60 px-4 py-3 text-body-sm focus:border-landing-oxblood focus:bg-landing-ivory focus:outline-none focus:ring-1 focus:ring-landing-oxblood" />
    </label>
  );
}

function splitAllowlist(value: string) {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}
