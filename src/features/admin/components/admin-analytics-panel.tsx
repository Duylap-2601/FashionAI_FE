'use client';

import {
  AnalyticsFunnel,
  AnalyticsKpiTile,
  AnalyticsNotConfiguredNotice,
  AnalyticsRankedTable,
  AnalyticsTrendChart,
} from '@/features/admin/components/admin-analytics-charts';
import {
  ANALYTICS_RANGE_OPTIONS,
  ANALYTICS_REALTIME_REFRESH_MS,
  CHANNEL_LABELS,
  DEVICE_LABELS,
  FEATURE_LABELS,
  GA4_CONSOLE_URL,
} from '@/features/admin/constants/admin-analytics';
import {
  formatCount,
  formatDuration,
  formatPercent,
  labelOf,
  platformLabelOf,
  safeRatio,
} from '@/features/admin/services/analytics-format';
import { fetchAnalyticsRealtime, fetchAnalyticsReport } from '@/features/admin/services/queries';
import type { AnalyticsRange, AnalyticsRealtimeResult, AnalyticsReportResult } from '@/features/admin/types/admin-analytics';
import { AtelierLoader } from '@/components/ui/AtelierLoader';
import { getErrorMessage } from '@/lib/errors';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

function isAbortError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const record = error as { name?: string; code?: string };
  return record.name === 'CanceledError' || record.name === 'AbortError' || record.code === 'ERR_CANCELED';
}

/** Nhiều biến thể source (vd. facebook và l.facebook.com) gộp về cùng một nền tảng. */
function platformRows(sources: { source: string; users: number }[]) {
  const byLabel = new Map<string, number>();
  for (const row of sources) {
    const label = platformLabelOf(row.source);
    byLabel.set(label, (byLabel.get(label) ?? 0) + row.users);
  }
  return [...byLabel.entries()]
    .map(([label, users]) => ({ label, users }))
    .sort((a, b) => b.users - a.users);
}

/** `refreshSignal` tăng lên khi admin bấm nút làm mới trên header. */
export function AdminAnalyticsPanel({ refreshSignal = 0 }: { refreshSignal?: number }) {
  const [range, setRange] = useState<AnalyticsRange>('28d');
  const [report, setReport] = useState<AnalyticsReportResult | null>(null);
  const [realtime, setRealtime] = useState<AnalyticsRealtimeResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const lastRefreshSignal = useRef(refreshSignal);

  useEffect(() => {
    const controller = new AbortController();
    // Chỉ lần tải do nút làm mới mới bỏ qua cache 15 phút của backend.
    const force = refreshSignal !== lastRefreshSignal.current;
    lastRefreshSignal.current = refreshSignal;
    setIsLoading(true);
    setError(null);
    fetchAnalyticsReport(range, { signal: controller.signal }, force)
      .then(setReport)
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setError(getErrorMessage(err, 'Không thể tải báo cáo Google Analytics.'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [range, reloadKey, refreshSignal]);

  const loadRealtime = useCallback((signal?: AbortSignal) => {
    fetchAnalyticsRealtime({ signal })
      .then(setRealtime)
      // Số realtime chỉ là phụ: lỗi thì giữ số cũ, không làm phiền bằng toast.
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadRealtime(controller.signal);
    const timer = window.setInterval(() => loadRealtime(controller.signal), ANALYTICS_REALTIME_REFRESH_MS);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [loadRealtime]);

  useEffect(() => {
    if (refreshSignal === 0) return;
    const controller = new AbortController();
    loadRealtime(controller.signal);
    return () => controller.abort();
  }, [refreshSignal, loadRealtime]);

  const rangeOption = ANALYTICS_RANGE_OPTIONS.find((option) => option.value === range) ?? ANALYTICS_RANGE_OPTIONS[1];
  const periodLabel = `${rangeOption.days} ngày trước đó`;
  const data = report?.configured ? report : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.08] tracking-[-0.025em] text-landing-obsidian">Phân tích truy cập</h1>
          <p className="mt-1 text-body-sm text-landing-muted">
            Nguồn Google Analytics 4 · số liệu trễ vài giờ · nút làm mới trên header bỏ qua cache 15 phút · doanh thu và đơn
            hàng xem ở tab Dashboard
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {realtime?.configured ? (
            <span className="flex items-center gap-1.5 rounded-[2px] border border-landing-line bg-landing-ivory px-3 py-1.5 text-[12px] text-landing-obsidian">
              <span className="h-2 w-2 rounded-full bg-semantic-success" aria-hidden />
              <strong className="text-landing-obsidian">{formatCount(realtime.activeUsers)}</strong> người đang online
            </span>
          ) : null}
          <div className="flex rounded-[2px] border border-landing-line bg-landing-ivory p-0.5" role="group" aria-label="Khoảng thời gian">
            {ANALYTICS_RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={range === option.value}
                onClick={() => setRange(option.value)}
                className={`rounded-[2px] px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                  range === option.value ? 'bg-landing-oxblood text-landing-paper' : 'text-landing-obsidian hover:text-landing-obsidian'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <a
            href={GA4_CONSOLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-[2px] border border-landing-line bg-landing-ivory px-3 py-1.5 text-[12px] font-semibold text-landing-obsidian hover:text-landing-obsidian"
          >
            Mở GA4 <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-[2px] border border-destructive/30 bg-destructive/10 p-4 text-body-sm text-destructive">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="flex shrink-0 items-center gap-1 font-semibold hover:underline"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Thử lại
          </button>
        </div>
      ) : null}

      {isLoading && !report ? (
        <div className="flex justify-center py-16">
          <AtelierLoader size="md" label="Đang may báo cáo" />
        </div>
      ) : null}

      {report && !report.configured ? <AnalyticsNotConfiguredNotice /> : null}

      {data ? (
        // Đổi khoảng thời gian thì giữ báo cáo cũ, làm mờ trong lúc tải để không nhảy layout.
        <div className={`flex flex-col gap-6 transition-opacity ${isLoading ? 'opacity-60' : ''}`} aria-busy={isLoading}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <AnalyticsKpiTile
              label="Người dùng hoạt động"
              value={formatCount(data.kpis.current.activeUsers)}
              current={data.kpis.current.activeUsers}
              previous={data.kpis.previous.activeUsers}
              periodLabel={periodLabel}
              accent="orders"
            />
            <AnalyticsKpiTile
              label="Người dùng mới"
              value={formatCount(data.kpis.current.newUsers)}
              current={data.kpis.current.newUsers}
              previous={data.kpis.previous.newUsers}
              periodLabel={periodLabel}
              accent="products"
            />
            <AnalyticsKpiTile
              label="Phiên truy cập"
              value={formatCount(data.kpis.current.sessions)}
              current={data.kpis.current.sessions}
              previous={data.kpis.previous.sessions}
              periodLabel={periodLabel}
              accent="ai"
            />
            <AnalyticsKpiTile
              label="Tỷ lệ tương tác"
              value={formatPercent(data.kpis.current.engagementRate)}
              current={data.kpis.current.engagementRate}
              previous={data.kpis.previous.engagementRate}
              periodLabel={periodLabel}
              accent="users"
            />
            <AnalyticsKpiTile
              label="Thời lượng phiên TB"
              value={formatDuration(data.kpis.current.averageSessionDuration)}
              current={data.kpis.current.averageSessionDuration}
              previous={data.kpis.previous.averageSessionDuration}
              periodLabel={periodLabel}
              accent="reviews"
            />
            <AnalyticsKpiTile
              label="Tỷ lệ chuyển đổi"
              value={formatPercent(safeRatio(data.kpis.current.purchases, data.kpis.current.sessions))}
              current={safeRatio(data.kpis.current.purchases, data.kpis.current.sessions)}
              previous={safeRatio(data.kpis.previous.purchases, data.kpis.previous.sessions)}
              periodLabel={periodLabel}
              accent="revenue"
            />
          </div>

          <AnalyticsTrendChart data={data.trend} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <AnalyticsFunnel steps={data.funnel} />
            <div className="flex flex-col gap-6">
              <AnalyticsRankedTable
                title="Kênh truy cập"
                description="Kênh mang người dùng tới website"
                nameLabel="Kênh"
                columns={[{ label: 'Phiên' }, { label: 'Người dùng' }, { label: 'Tương tác', format: formatPercent }]}
                rows={data.channels.map((row) => ({
                  key: row.channel,
                  name: labelOf(CHANNEL_LABELS, row.channel),
                  values: [row.sessions, row.activeUsers, row.engagementRate],
                }))}
              />
              <AnalyticsRankedTable
                title="Nền tảng người dùng đến từ"
                description="Theo UTM hoặc tên miền giới thiệu; một người dùng có thể đến từ nhiều nền tảng"
                nameLabel="Nền tảng"
                columns={[{ label: 'Người dùng' }]}
                rows={platformRows(data.platformSources ?? []).map((row) => ({
                  key: row.label,
                  name: row.label,
                  values: [row.users],
                }))}
              />
            </div>
          </div>

          <AnalyticsRankedTable
            title="Sản phẩm được quan tâm"
            description="Theo lượt xem chi tiết sản phẩm"
            nameLabel="Sản phẩm"
            columns={[{ label: 'Lượt xem' }, { label: 'Thêm giỏ' }, { label: 'Đã mua' }]}
            rows={data.topProducts.map((row) => ({
              key: row.name,
              name: labelOf({}, row.name),
              values: [row.views, row.addedToCart, row.purchased],
            }))}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <AnalyticsRankedTable
              title="Tính năng AI và tương tác"
              nameLabel="Hành động"
              columns={[{ label: 'Lượt' }, { label: 'Người dùng' }]}
              rows={data.features.map((row) => ({
                key: row.event,
                name: FEATURE_LABELS[row.event],
                values: [row.count, row.users],
              }))}
            />
            <AnalyticsRankedTable
              title="Thiết bị"
              nameLabel="Loại thiết bị"
              columns={[{ label: 'Người dùng' }]}
              rows={data.devices.map((row) => ({
                key: row.device,
                name: labelOf(DEVICE_LABELS, row.device),
                values: [row.activeUsers],
              }))}
            />
            <AnalyticsRankedTable
              title="Tỉnh / thành phố"
              nameLabel="Khu vực"
              columns={[{ label: 'Người dùng' }]}
              rows={data.cities.map((row) => ({
                key: row.city,
                name: labelOf({}, row.city),
                values: [row.activeUsers],
              }))}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
