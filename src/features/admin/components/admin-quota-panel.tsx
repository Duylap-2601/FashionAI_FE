'use client';

import type { UserTier } from '@/features/admin/types/admin-dashboard-page';
import type { AdminQuotaPanelProps } from '@/features/admin/types/admin-quota-panel';
import {
  Crown,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';

export function AdminQuotaPanel({ users, stats }: AdminQuotaPanelProps) {
  return (
    (() => {
      // Config per tier (matches backend AI_ACTION_LIMITS)
      const TIER_QUOTA: Record<UserTier, { tryon: number | null; label: string; color: string; bg: string; badge: string }> = {
        FREE: { tryon: null, label: 'Free', color: 'text-neutral-500', bg: 'bg-neutral-100', badge: 'bg-neutral-200 text-neutral-700' },
        MEMBER: { tryon: 10, label: 'Member', color: 'text-blue-600', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
        VIP: { tryon: 30, label: 'VIP', color: 'text-brand-gold', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
      };

      const freeUsers = users.filter(u => u.tier === 'FREE');
      const memberUsers = users.filter(u => u.tier === 'MEMBER');
      const vipUsers = users.filter(u => u.tier === 'VIP');

      const totalTryOnToday = stats?.tryOnToday ?? 0;
      const totalTryOnAll = stats?.tryOnCount ?? 0;

      // Top users by try-on count (top 20)
      const topTryOnUsers = [...users]
        .sort((a, b) => b.tryOns - a.tryOns)
        .slice(0, 20);

      const maxTryOns = topTryOnUsers[0]?.tryOns || 1;

      return (
        <div className="flex flex-col gap-8 max-w-[1000px]">
          <div>
            <h1 className="text-heading-h2 font-bold text-neutral-900">Thống kê sử dụng Quota</h1>
            <p className="text-body-sm text-neutral-500 mt-1">Tổng hợp lượt try-on AI và phân bổ theo gói thành viên</p>
          </div>

          {/* ── Stats overview ───────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {([
              { label: 'Try-on hôm nay', value: totalTryOnToday, icon: Sparkles, color: 'text-brand-gold', bg: 'bg-amber-50' },
              { label: 'Tổng try-on mọi thời gian', value: totalTryOnAll, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Tài khoản MEMBER', value: memberUsers.length, icon: Crown, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Tài khoản VIP', value: vipUsers.length, icon: ShieldCheck, color: 'text-brand-gold', bg: 'bg-amber-50' },
            ] as const).map(card => {
              const CardIcon = card.icon;
              return (
                <div key={card.label} className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-5 flex flex-col gap-3">
                  <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <CardIcon className={`w-4.5 h-4.5 ${card.color}`} />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${card.color}`}>{card.value.toLocaleString('vi-VN')}</div>
                    <div className="text-label-sm text-neutral-500 mt-0.5">{card.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Tier config table (read-only reference) ──────────────── */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
              <Settings className="w-4 h-4 text-neutral-400" />
              <h2 className="text-body-sm font-bold text-neutral-800">Cấu hình Quota theo Gói</h2>
              <span className="ml-auto text-label-xs text-neutral-400 italic">Cấu hình backend — chỉ xem</span>
            </div>
            <table className="w-full text-body-sm">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 text-label-xs uppercase tracking-wide">
                  <th className="px-6 py-3 text-left font-semibold">Gói</th>
                  <th className="px-6 py-3 text-center font-semibold">Số tài khoản</th>
                  <th className="px-6 py-3 text-center font-semibold">Try-On / ngày</th>
                  <th className="px-6 py-3 text-center font-semibold">AI Stylist / ngày</th>
                  <th className="px-6 py-3 text-center font-semibold">Chatbot / ngày</th>
                </tr>
              </thead>
              <tbody>
                {([
                  { tier: 'FREE' as UserTier, tryon: '—', stylist: '—', chat: '10', count: freeUsers.length },
                  { tier: 'MEMBER' as UserTier, tryon: '10', stylist: '10', chat: 'Unlimited', count: memberUsers.length },
                  { tier: 'VIP' as UserTier, tryon: '30', stylist: '30', chat: 'Unlimited', count: vipUsers.length },
                ]).map((row, i) => {
                  const cfg = TIER_QUOTA[row.tier];
                  return (
                    <tr key={row.tier} className={`border-t border-neutral-100 ${i % 2 === 1 ? 'bg-neutral-50/50' : ''}`}>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-label-xs font-bold ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-neutral-800">{row.count.toLocaleString('vi-VN')}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${row.tryon === '—' ? 'text-neutral-400' : 'text-brand-navy'}`}>{row.tryon}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${row.stylist === '—' ? 'text-neutral-400' : 'text-brand-navy'}`}>{row.stylist}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${row.chat === 'Unlimited' ? 'text-green-600' : row.chat === '—' ? 'text-neutral-400' : 'text-brand-navy'}`}>{row.chat}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Top users by try-on usage ────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <h2 className="text-body-sm font-bold text-neutral-800">Top người dùng Try-On nhiều nhất</h2>
              <span className="ml-auto text-label-xs text-neutral-400 italic">Tổng lịch sử</span>
            </div>
            {topTryOnUsers.length === 0 ? (
              <div className="px-6 py-12 text-center text-neutral-400 text-body-sm">
                Chưa có dữ liệu try-on
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {topTryOnUsers.map((u, idx) => {
                  const cfg = TIER_QUOTA[u.tier];
                  const dailyLimit = cfg.tryon;
                  const pct = dailyLimit ? Math.min(100, Math.round((u.tryOns / maxTryOns) * 100)) : Math.round((u.tryOns / maxTryOns) * 100);
                  return (
                    <div key={u.id} className="px-6 py-3.5 flex items-center gap-4">
                      {/* Rank */}
                      <span className={`w-6 text-center text-label-xs font-bold shrink-0 ${idx < 3 ? 'text-brand-gold' : 'text-neutral-400'}`}>
                        {idx + 1}
                      </span>
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-brand-navy/10 flex items-center justify-center shrink-0 text-brand-navy font-bold text-xs uppercase">
                        {u.name.charAt(0)}
                      </div>
                      {/* Name + email */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-body-sm font-semibold text-neutral-800 truncate">{u.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                        </div>
                        <span className="text-label-xs text-neutral-400 truncate block">{u.email}</span>
                      </div>
                      {/* Progress bar */}
                      <div className="hidden sm:flex flex-col items-end gap-1 min-w-[140px]">
                        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-navy rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-label-xs text-neutral-500">{u.tryOns.toLocaleString('vi-VN')} lượt</span>
                      </div>
                      {/* Count badge */}
                      <span className="sm:hidden text-body-sm font-bold text-brand-navy shrink-0">{u.tryOns}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Tier distribution breakdown ──────────────────────────── */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6">
            <h2 className="text-body-sm font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-neutral-400" />
              Phân bổ người dùng theo Gói
            </h2>
            <div className="flex flex-col gap-3">
              {([
                { tier: 'VIP' as UserTier, count: vipUsers.length },
                { tier: 'MEMBER' as UserTier, count: memberUsers.length },
                { tier: 'FREE' as UserTier, count: freeUsers.length },
              ]).map(row => {
                const cfg = TIER_QUOTA[row.tier];
                const pct = users.length > 0 ? Math.round((row.count / users.length) * 100) : 0;
                return (
                  <div key={row.tier} className="flex items-center gap-3">
                    <span className={`w-16 text-label-xs font-bold shrink-0 ${cfg.badge} px-2 py-0.5 rounded-full text-center`}>{cfg.label}</span>
                    <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${row.tier === 'VIP' ? 'bg-brand-gold' : row.tier === 'MEMBER' ? 'bg-blue-500' : 'bg-neutral-300'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-label-xs text-neutral-600 font-semibold w-20 text-right shrink-0">
                      {row.count} người ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    })()
  );
}
