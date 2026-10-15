'use client';

import { buildRevenueChart } from '@/features/admin/services/dashboard-metrics';
import { fmt } from '@/features/admin/services/format';
import type { AdminRevenueChartProps } from '@/features/admin/types/admin-revenue-chart';
import React, { useMemo, useState } from 'react';

const BRAND = 'var(--color-brand-burgundy)';

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
      <div className="flex flex-wrap items-center gap-4 py-2.5 px-4 bg-neutral-50 rounded-xl border border-neutral-200/70 text-body-sm">
        <div>
          <span className="text-neutral-500 text-label-sm">Doanh thu {days} ngày: </span>
          <strong className="text-brand-navy font-bold">{fmt(chart.totalRevenue)}</strong>
        </div>
        <div className="w-px h-4 bg-neutral-200 hidden sm:block" />
        <div>
          <span className="text-neutral-500 text-label-sm">Tổng đơn: </span>
          <strong className="text-neutral-800 font-bold">{chart.totalOrders} đơn</strong>
        </div>
        <div className="w-px h-4 bg-neutral-200 hidden sm:block" />
        <div>
          <span className="text-neutral-500 text-label-sm">Trung bình ngày: </span>
          <strong className="text-neutral-800 font-bold">{fmt(Math.round(chart.totalRevenue / days))}</strong>
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
              <stop offset="0%" style={{ stopColor: BRAND, stopOpacity: 0.25 }} />
              <stop offset="100%" style={{ stopColor: BRAND, stopOpacity: 0 }} />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-axis labels */}
          <line x1="25" y1="35" x2="575" y2="35" className="stroke-neutral-100" strokeWidth="1" strokeDasharray="4 4" />
          <text x="25" y="30" className="text-[9px] fill-neutral-400 font-sans">{fmt(maxRevenue)}</text>

          <line x1="25" y1="105" x2="575" y2="105" className="stroke-neutral-100" strokeWidth="1" strokeDasharray="4 4" />
          <text x="25" y="100" className="text-[9px] fill-neutral-400 font-sans">{fmt(Math.round(maxRevenue / 2))}</text>

          <line x1="25" y1="180" x2="575" y2="180" className="stroke-neutral-200" strokeWidth="1" />
          <text x="25" y="175" className="text-[9px] fill-neutral-400 font-sans">0đ</text>

          {/* Area & Line */}
          <path d={areaD} fill="url(#revenueGradient)" />
          <path d={pathD} className="stroke-brand-burgundy" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points & Labels */}
          {points.map(p => {
            const isHovered = hoveredKey === p.dateKey;
            return (
              <g key={p.dateKey} className="cursor-pointer" onMouseEnter={() => setHoveredKey(p.dateKey)}>
                {/* Invisible hit box for easy hovering */}
                <rect x={p.x - hitBoxWidth / 2} y={10} width={hitBoxWidth} height={190} fill="transparent" />
                {/* Vertical guide line on hover */}
                {isHovered && (
                  <line x1={p.x} y1={35} x2={p.x} y2={180} className="stroke-brand-burgundy" strokeWidth="1.5" strokeDasharray="3 3" />
                )}
                {/* Point circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  strokeWidth={isHovered ? 3 : 2}
                  className={`stroke-brand-burgundy transition-all ${isHovered ? 'fill-white' : 'fill-brand-burgundy'}`}
                />
                {/* X-axis date label */}
                <text
                  x={p.x}
                  y={198}
                  textAnchor="middle"
                  className={`text-[10px] font-sans ${isHovered ? 'fill-neutral-900 font-bold' : 'fill-neutral-400'}`}
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
            className="absolute top-2 pointer-events-none transition-all duration-150 bg-brand-navy text-white text-body-sm px-3.5 py-2.5 rounded-xl shadow-xl z-20"
            style={{
              left: `${Math.min(Math.max((hoveredPoint.x / 600) * 100, 15), 85)}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <p className="text-[11px] text-white/70 font-semibold">{hoveredPoint.fullDate}</p>
            <p className="text-[14px] font-bold text-brand-gold mt-0.5">{fmt(hoveredPoint.revenue)}</p>
            <p className="text-[11px] text-white/90 mt-0.5">{hoveredPoint.ordersCount} đơn hàng</p>
          </div>
        )}
      </div>
    </div>
  );
});
