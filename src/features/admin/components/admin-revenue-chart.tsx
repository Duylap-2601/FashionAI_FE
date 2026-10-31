'use client';

import { buildRevenueChart } from '@/features/admin/services/dashboard-metrics';
import { fmt } from '@/features/admin/services/format';
import type { AdminRevenueChartProps } from '@/features/admin/types/admin-revenue-chart';
import React, { useMemo, useState } from 'react';

const REVENUE_LINE = 'var(--color-metric-revenue)';

/** Biểu đồ doanh thu theo ngày (SVG). State hover nằm ở đây để rê chuột chỉ render lại biểu đồ. */
export const AdminRevenueChart = React.memo(function AdminRevenueChart({ orders, days }: AdminRevenueChartProps) {
  // Chỉ giữ ngày đang hover: tooltip luôn lấy số liệu của lần tải mới nhất.
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const chart = useMemo(() => buildRevenueChart(orders, days), [orders, days]);
  const { points, maxRevenue } = chart;
  const hoveredPoint = points.find(p => p.dateKey === hoveredKey) ?? null;

  if (points.length === 0) return null;

  const linePoints = points.map(p => `${p.x} ${p.y}`).join(' L ');
  const pathD = `M ${linePoints}`;
  const areaD = `M ${points[0].x} 180 L ${linePoints} L ${points[points.length - 1].x} 180 Z`;
  const hitBoxWidth = 600 / days;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Quick summary numbers for this period */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border border-landing-line bg-landing-paper/60 px-4 py-3 text-[12px]">
        <div>
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-landing-muted">
            Doanh thu {days} ngày
          </span>
          <strong className="ml-2 font-mono text-metric-revenue">{fmt(chart.totalRevenue)}</strong>
        </div>
        <div className="hidden h-3 w-px bg-landing-line sm:block" />
        <div>
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-landing-muted">
            Tổng đơn
          </span>
          <strong className="ml-2 font-mono text-landing-obsidian">{chart.totalOrders}</strong>
        </div>
        <div className="hidden h-3 w-px bg-landing-line sm:block" />
        <div>
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-landing-muted">
            Trung bình ngày
          </span>
          <strong className="ml-2 font-mono text-landing-obsidian">
            {fmt(Math.round(chart.totalRevenue / days))}
          </strong>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full">
        <svg
          className="w-full h-[240px]"
          viewBox="0 0 600 210"
          fill="none"
          onMouseLeave={() => setHoveredKey(null)}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: REVENUE_LINE, stopOpacity: 0.18 }} />
              <stop offset="100%" style={{ stopColor: REVENUE_LINE, stopOpacity: 0 }} />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-axis labels */}
          <line x1="25" y1="35" x2="575" y2="35" className="stroke-landing-line" strokeWidth="1" strokeDasharray="4 4" />
          <text x="25" y="30" className="fill-landing-muted font-mono text-[9px]">{fmt(maxRevenue)}</text>

          <line x1="25" y1="105" x2="575" y2="105" className="stroke-landing-line" strokeWidth="1" strokeDasharray="4 4" />
          <text x="25" y="100" className="fill-landing-muted font-mono text-[9px]">{fmt(Math.round(maxRevenue / 2))}</text>

          <line x1="25" y1="180" x2="575" y2="180" className="stroke-landing-taupe" strokeWidth="1" />
          <text x="25" y="175" className="fill-landing-muted font-mono text-[9px]">0đ</text>

          {/* Area & Line */}
          <path d={areaD} fill="url(#revenueGradient)" />
          <path d={pathD} className="stroke-metric-revenue" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points & Labels */}
          {points.map(p => {
            const isHovered = hoveredKey === p.dateKey;
            return (
              <g key={p.dateKey} className="cursor-pointer" onMouseEnter={() => setHoveredKey(p.dateKey)}>
                {/* Invisible hit box for easy hovering */}
                <rect x={p.x - hitBoxWidth / 2} y={10} width={hitBoxWidth} height={190} fill="transparent" />
                {/* Vertical guide line on hover */}
                {isHovered && (
                  <line x1={p.x} y1={35} x2={p.x} y2={180} className="stroke-metric-revenue" strokeWidth="1" strokeDasharray="3 3" />
                )}
                {/* Point circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5 : 3.5}
                  strokeWidth={isHovered ? 2.5 : 2}
                  className={`stroke-metric-revenue transition-all ${isHovered ? 'fill-landing-ivory' : 'fill-metric-revenue'}`}
                />
                {/* X-axis date label */}
                <text
                  x={p.x}
                  y={198}
                  textAnchor="middle"
                  className={`font-mono text-[9px] ${isHovered ? 'fill-landing-obsidian font-semibold' : 'fill-landing-muted'}`}
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Interactive Tooltip Card */}
        {hoveredPoint && (
          <div
            className="pointer-events-none absolute top-2 z-20 rounded-[2px] border border-landing-paper/15 bg-landing-obsidian px-3 py-2 transition-all duration-150"
            style={{
              left: `${Math.min(Math.max((hoveredPoint.x / 600) * 100, 15), 85)}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-landing-brass">
              {hoveredPoint.fullDate}
            </p>
            <p className="mt-0.5 font-mono text-[13px] font-semibold text-landing-paper">
              {fmt(hoveredPoint.revenue)}
            </p>
            <p className="mt-0.5 text-[10px] text-landing-paper/70">
              {hoveredPoint.ordersCount} đơn hàng
            </p>
          </div>
        )}
      </div>
    </div>
  );
});
