'use client';

import {
  AnalyticsFunnel,
  AnalyticsKpiTile,
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
  safeRatio,
} from '@/features/admin/services/analytics-format';
import { fetchAnalyticsRealtime, fetchAnalyticsReport } from '@/features/admin/services/queries';
import type { AnalyticsRange, AnalyticsRealtimeResult, AnalyticsReportResult } from '@/features/admin/types/admin-analytics';
import { getErrorMessage } from '@/lib/errors';
import { BarChart3, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

function isAbortError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const record = error as { name?: string; code?: string };
  return record.name === 'CanceledError' || record.name === 'AbortError' || record.code === 'ERR_CANCELED';
}

function NotConfiguredNotice() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-cream text-brand-navy">
          <BarChart3 className="h-4 w-4" />
        </div>
        <div className="text-body-sm text-neutral-600">
          <p className="font-bold text-neutral-900">Chưa kết nối Google Analytics 4</p>
          <p className="mt-1">Backend chưa có cấu hình đọc dữ liệu GA4. Cần khai báo trên server:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <code className="text-[12px]">GA4_PROPERTY_ID</code>: số property GA4 (không phải mã G-XXXX).
            </li>
            <li>
              <code className="text-[12px]">GA4_SERVICE_ACCOUNT_JSON_BASE64</code>: key service account, và thêm email
              service account vào property với vai trò Viewer.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function AdminAnalyticsPanel() {
  const [range, setRange] = useState<AnalyticsRange>('28d');
  const [report, setReport] = useState<AnalyticsReportResult | null>(null);
  const [realtime, setRealtime] = useState<AnalyticsRealtimeResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    fetchAnalyticsReport(range, { signal: controller.signal })
      .then(setReport)
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setError(getErrorMessage(err, 'Không thể tải báo cáo Google Analytics.'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [range, reloadKey]);

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

  const rangeOption = ANALYTICS_RANGE_OPTIONS.find((option) => option.value === range) ?? ANALYTICS_RANGE_OPTIONS[1];
  const periodLabel = `${rangeOption.days} ngày trước đó`;
  const data = report?.configured ? report : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-heading-h2 font-bold text-neutral-900">Phân tích truy cập</h1>
          <p className="mt-1 text-body-sm text-neutral-500">
            Nguồn Google Analytics 4 · số liệu trễ vài giờ · doanh thu và đơn hàng xem ở tab Dashboard
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {realtime?.configured ? (
            <span className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[12px] text-neutral-600">
              <span className="h-2 w-2 rounded-full bg-semantic-success" aria-hidden />
              <strong className="text-neutral-900">{formatCount(realtime.activeUsers)}</strong> người đang online
            </span>
          ) : null}
          <div className="flex rounded-lg border border-neutral-200 bg-white p-0.5" role="group" aria-label="Khoảng thời gian">
            {ANALYTICS_RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={range === option.value}
                onClick={() => setRange(option.value)}
                className={`rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                  range === option.value ? 'bg-brand-navy text-white' : 'text-neutral-600 hover:text-neutral-900'
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
            className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-neutral-600 hover:text-neutral-900"
          >
            Mở GA4 <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-body-sm text-red-700">
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
          <Loader2 className="h-8 w-8 animate-spin text-brand-navy" aria-label="Đang tải báo cáo" />
        </div>
      ) : null}

      {report && !report.configured ? <NotConfiguredNotice /> : null}

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
            />
            <AnalyticsKpiTile
              label="Người dùng mới"
              value={formatCount(data.kpis.current.newUsers)}
              current={data.kpis.current.newUsers}
              previous={data.kpis.previous.newUsers}
              periodLabel={periodLabel}
            />
            <AnalyticsKpiTile
              label="Phiên truy cập"
              value={formatCount(data.kpis.current.sessions)}
              current={data.kpis.current.sessions}
              previous={data.kpis.previous.sessions}
              periodLabel={periodLabel}
            />
            <AnalyticsKpiTile
              label="Tỷ lệ tương tác"
              value={formatPercent(data.kpis.current.engagementRate)}
              current={data.kpis.current.engagementRate}
              previous={data.kpis.previous.engagementRate}
              periodLabel={periodLabel}
            />
            <AnalyticsKpiTile
              label="Thời lượng phiên TB"
              value={formatDuration(data.kpis.current.averageSessionDuration)}
              current={data.kpis.current.averageSessionDuration}
              previous={data.kpis.previous.averageSessionDuration}
              periodLabel={periodLabel}
            />
            <AnalyticsKpiTile
              label="Tỷ lệ chuyển đổi"
              value={formatPercent(safeRatio(data.kpis.current.purchases, data.kpis.current.sessions))}
              current={safeRatio(data.kpis.current.purchases, data.kpis.current.sessions)}
              previous={safeRatio(data.kpis.previous.purchases, data.kpis.previous.sessions)}
              periodLabel={periodLabel}
            />
          </div>

          <AnalyticsTrendChart data={data.trend} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <AnalyticsFunnel steps={data.funnel} />
            <AnalyticsRankedTable
              title="Nguồn truy cập"
              description="Kênh mang người dùng tới website"
              nameLabel="Kênh"
              columns={[{ label: 'Phiên' }, { label: 'Người dùng' }, { label: 'Tương tác', format: formatPercent }]}
              rows={data.channels.map((row) => ({
                key: row.channel,
                name: labelOf(CHANNEL_LABELS, row.channel),
                values: [row.sessions, row.activeUsers, row.engagementRate],
              }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
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
            <AnalyticsRankedTable
              title="Trang xem nhiều"
              nameLabel="Đường dẫn"
              columns={[{ label: 'Lượt xem' }, { label: 'Người dùng' }]}
              rows={data.topPages.map((row) => ({
                key: row.path,
                name: row.path,
                values: [row.views, row.activeUsers],
              }))}
            />
          </div>

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
