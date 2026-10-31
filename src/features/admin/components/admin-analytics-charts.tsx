'use client';

import { FUNNEL_LABELS } from '@/features/admin/constants/admin-analytics';
import {
  formatCompact,
  formatCount,
  formatLongDate,
  formatPercent,
  formatShortDate,
  percentChange,
  safeRatio,
} from '@/features/admin/services/analytics-format';
import type { AnalyticsReport, AnalyticsTrendPoint } from '@/features/admin/types/admin-analytics';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { ArrowDownRight, ArrowUpRight, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

const CARD_CLASS = 'rounded-[2px] border border-landing-line bg-landing-ivory p-5';
const EMPTY_TEXT = 'Chưa có dữ liệu trong kỳ này.';

type MetricAccent = 'revenue' | 'orders' | 'products' | 'users' | 'reviews' | 'ai';

const METRIC_ACCENT: Record<MetricAccent, { text: string; rule: string }> = {
  revenue: { text: 'text-metric-revenue', rule: 'border-t-metric-revenue' },
  orders: { text: 'text-metric-orders', rule: 'border-t-metric-orders' },
  products: { text: 'text-metric-products', rule: 'border-t-metric-products' },
  users: { text: 'text-metric-users', rule: 'border-t-metric-users' },
  reviews: { text: 'text-metric-reviews', rule: 'border-t-metric-reviews' },
  ai: { text: 'text-metric-ai', rule: 'border-t-metric-ai' },
};

const trendConfig = {
  activeUsers: { label: 'Người dùng hoạt động', color: 'var(--color-metric-orders)' },
  sessions: { label: 'Phiên truy cập', color: 'var(--color-metric-ai)' },
} satisfies ChartConfig;

export function AnalyticsCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={CARD_CLASS}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[1.05rem] leading-tight text-landing-obsidian">{title}</h2>
          {description ? <p className="mt-0.5 text-[12px] text-landing-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AnalyticsNotConfiguredNotice() {
  return (
    <div className={CARD_CLASS}>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] bg-landing-paper text-landing-oxblood">
          <BarChart3 className="h-4 w-4" />
        </div>
        <div className="text-body-sm text-landing-obsidian">
          <p className="font-bold text-landing-obsidian">Chưa kết nối Google Analytics 4</p>
          <p className="mt-1">Backend chưa có cấu hình đọc dữ liệu GA4. Cần khai báo trên server:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <code className="text-[12px]">GA4_PROPERTY_ID</code>: số property GA4 (không phải mã G-XXXX).
            </li>
            <li>
              <code className="text-[12px]">GA_SERVICE_ACCOUNT_EMAIL</code> và{' '}
              <code className="text-[12px]">GA_PRIVATE_KEY</code>: lấy từ key service account, và thêm email service
              account vào property với vai trò Viewer.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsKpiTile({
  label,
  value,
  current,
  previous,
  periodLabel,
  accent,
}: {
  label: string;
  value: string;
  current: number;
  previous: number;
  periodLabel: string;
  accent: MetricAccent;
}) {
  const change = percentChange(current, previous);
  const isUp = change !== null && change > 0;
  const isDown = change !== null && change < 0;
  const DeltaIcon = isDown ? ArrowDownRight : ArrowUpRight;
  const accentCls = METRIC_ACCENT[accent];

  return (
    <div className={`${CARD_CLASS} flex flex-col gap-2 border-t-2 ${accentCls.rule}`}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-landing-muted">{label}</span>
      <span className={`font-mono text-[26px] font-semibold leading-tight ${accentCls.text}`}>{value}</span>
      <span className="flex items-center gap-1 text-[11px] text-landing-muted">
        {change === null ? (
          <span>Chưa có số liệu {periodLabel}</span>
        ) : (
          <>
            <span
              className={`flex items-center gap-0.5 font-semibold ${
                isUp ? 'text-metric-products' : isDown ? 'text-destructive' : 'text-landing-obsidian'
              }`}
            >
              {isUp || isDown ? <DeltaIcon className="h-3 w-3" aria-hidden /> : null}
              {isUp ? '+' : ''}
              {formatPercent(change)}
            </span>
            <span>so với {periodLabel}</span>
          </>
        )}
      </span>
    </div>
  );
}

function ViewToggle({ showTable, onChange }: { showTable: boolean; onChange: (showTable: boolean) => void }) {
  return (
    <div className="flex rounded-[2px] border border-landing-line p-0.5 text-[12px] font-semibold" role="group" aria-label="Kiểu hiển thị">
      {[
        { label: 'Biểu đồ', table: false },
        { label: 'Bảng', table: true },
      ].map((option) => (
        <button
          key={option.label}
          type="button"
          aria-pressed={showTable === option.table}
          onClick={() => onChange(option.table)}
          className={`rounded-[2px] px-2.5 py-1 transition-colors ${
            showTable === option.table ? 'bg-landing-paper text-landing-obsidian' : 'text-landing-muted hover:text-landing-obsidian'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function AnalyticsTrendChart({ data }: { data: AnalyticsTrendPoint[] }) {
  const [showTable, setShowTable] = useState(false);
  const isEmpty = data.every((point) => point.activeUsers === 0 && point.sessions === 0);

  return (
    <AnalyticsCard
      title="Người dùng và phiên theo ngày"
      description="Người dùng hoạt động và số phiên truy cập mỗi ngày"
      action={<ViewToggle showTable={showTable} onChange={setShowTable} />}
    >
      {showTable ? (
        <div className="max-h-[300px] overflow-y-auto">
          <table className="w-full text-[12px]">
            <thead className="sticky top-0 bg-landing-ivory text-left text-landing-muted">
              <tr>
                <th className="py-2 font-medium">Ngày</th>
                <th className="py-2 text-right font-medium">Người dùng</th>
                <th className="py-2 text-right font-medium">Phiên</th>
              </tr>
            </thead>
            <tbody className="tabular-nums text-landing-obsidian">
              {[...data].reverse().map((point) => (
                <tr key={point.date} className="border-t border-landing-line">
                  <td className="py-1.5">{formatLongDate(point.date)}</td>
                  <td className="py-1.5 text-right">{formatCount(point.activeUsers)}</td>
                  <td className="py-1.5 text-right">{formatCount(point.sessions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          {isEmpty ? (
            // Giữ khung trục và lưới để bố cục không đổi; chữ phủ lên vùng vẽ.
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 text-center">
              <p className="text-body-sm font-semibold text-landing-obsidian">{EMPTY_TEXT}</p>
              <p className="text-[12px] text-landing-muted">Property GA4 mới tạo có thể cần 24–48 giờ để có số liệu.</p>
            </div>
          ) : null}
          <ChartContainer config={trendConfig} className={`aspect-auto h-[300px] w-full ${isEmpty ? 'opacity-40' : ''}`}>
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={(value: string) => formatShortDate(value)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                allowDecimals={false}
                tickFormatter={(value: number) => formatCompact(value)}
              />
              <ChartTooltip
                cursor={{ strokeWidth: 1 }}
                content={<ChartTooltipContent indicator="line" labelFormatter={(value) => formatLongDate(String(value))} />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              {(['activeUsers', 'sessions'] as const).map((key) => (
                <Line
                  key={key}
                  dataKey={key}
                  type="monotone"
                  stroke={`var(--color-${key})`}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--background)' }}
                />
              ))}
            </LineChart>
          </ChartContainer>
        </div>
      )}
    </AnalyticsCard>
  );
}

export function AnalyticsFunnel({ steps }: { steps: AnalyticsReport['funnel'] }) {
  const top = steps[0]?.users ?? 0;

  return (
    <AnalyticsCard title="Phễu mua hàng" description="Số người dùng thực hiện từng bước trong kỳ">
      {top === 0 ? (
        <p className="py-6 text-center text-body-sm text-landing-muted">Chưa có lượt xem sản phẩm nào trong kỳ này.</p>
      ) : (
        <ol className="flex flex-col gap-4">
          {steps.map((step, index) => {
            const previous = index > 0 ? steps[index - 1].users : null;
            return (
              <li key={step.event} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3 text-[12px]">
                  <span className="font-semibold text-landing-obsidian">{FUNNEL_LABELS[step.event]}</span>
                  <span className="text-landing-muted">
                    <strong className="text-body-sm text-landing-obsidian">{formatCount(step.users)}</strong>
                    {previous !== null ? ` · ${formatPercent(safeRatio(step.users, previous))} từ bước trước` : ''}
                  </span>
                </div>
                <div className="h-3 rounded-[2px] bg-landing-paper">
                  <div
                    className="h-3 rounded-[2px] bg-metric-orders"
                    style={{ width: `${Math.max(safeRatio(step.users, top) * 100, step.users > 0 ? 1 : 0)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </AnalyticsCard>
  );
}

export interface RankedColumn {
  label: string;
  format?: (value: number) => string;
}

/**
 * Bảng xếp hạng; cột đầu tiên là thước đo chính, có thanh tỉ lệ một màu dưới nhãn
 * để so độ lớn mà không cần biểu đồ riêng.
 */
export function AnalyticsRankedTable({
  title,
  description,
  nameLabel,
  columns,
  rows,
  emptyText = EMPTY_TEXT,
}: {
  title: string;
  description?: string;
  nameLabel: string;
  columns: RankedColumn[];
  rows: { key: string; name: string; values: number[] }[];
  emptyText?: string;
}) {
  const max = Math.max(0, ...rows.map((row) => row.values[0] ?? 0));
  // Một số bảng luôn có đủ dòng (vd. tính năng AI) nên toàn số 0 cũng coi là chưa có dữ liệu.
  const isEmpty = max === 0;

  return (
    <AnalyticsCard title={title} description={description}>
      {isEmpty ? (
        <p className="py-6 text-center text-body-sm text-landing-muted">{emptyText}</p>
      ) : (
        <table className="w-full table-fixed text-[12px]">
          <thead className="text-left text-[9px] font-semibold uppercase tracking-[0.14em] text-landing-muted">
            <tr>
              <th className="pb-2 font-medium">{nameLabel}</th>
              {columns.map((column) => (
                <th key={column.label} className="w-[88px] pb-2 text-right font-medium">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono text-landing-obsidian">
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-landing-line align-top">
                <td className="py-2 pr-3 font-sans">
                  <span className="block truncate font-medium text-landing-obsidian" title={row.name}>
                    {row.name}
                  </span>
                  <span className="mt-1.5 block h-1.5 rounded-[2px] bg-landing-paper">
                    <span
                      className="block h-1.5 rounded-[2px] bg-metric-orders"
                      style={{ width: `${safeRatio(row.values[0] ?? 0, max) * 100}%` }}
                    />
                  </span>
                </td>
                {columns.map((column, index) => (
                  <td key={column.label} className="py-2 text-right tabular-nums">
                    {(column.format ?? formatCount)(row.values[index] ?? 0)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AnalyticsCard>
  );
}
