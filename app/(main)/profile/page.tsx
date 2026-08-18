'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  User, Ruler, History, ShoppingBag, Sparkles, LogOut,
  ChevronRight, Lock, Edit3, CheckCircle2, AlertCircle,
  Crown, Zap, Star, Camera, Eye, EyeOff, Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMeasurements, useChangePassword } from '@/hooks/useMeasurements';
import { useQuota } from '@/hooks/useQuota';

// ─── Change Password Modal ──────────────────────────────────────────────────
function ChangePasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { changePassword, isChanging } = useChangePassword();

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }, 1800);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Mật khẩu hiện tại không đúng.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-fadeInUp">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-brand-navy" />
            </div>
            <div>
              <h2 className="text-heading-h3 font-semibold text-neutral-900">Đổi mật khẩu</h2>
              <p className="text-label-sm text-neutral-500">Bảo mật tài khoản của bạn</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 transition-colors">
            ✕
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center py-8 gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-semantic-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-semantic-success" />
            </div>
            <p className="text-body-md font-semibold text-neutral-900">Đổi mật khẩu thành công!</p>
            <p className="text-body-sm text-neutral-500">Đang đóng cửa sổ...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-semantic-error text-body-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field) => {
              const labels = {
                currentPassword: 'Mật khẩu hiện tại',
                newPassword: 'Mật khẩu mới',
                confirmPassword: 'Xác nhận mật khẩu mới',
              };
              const showKey = (field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm') as 'current' | 'new' | 'confirm';
              return (
                <div key={field}>
                  <label className="block text-label-sm font-medium text-neutral-700 mb-1.5">{labels[field]}</label>
                  <div className="relative">
                    <input
                      type={showPw[showKey] ? 'text' : 'password'}
                      value={form[field]}
                      onChange={handleChange(field)}
                      required
                      disabled={isChanging}
                      placeholder={field === 'newPassword' ? 'Ít nhất 8 ký tự' : ''}
                      className="w-full h-11 pl-3.5 pr-10 bg-white border border-neutral-300 rounded-xl text-body-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => { const k = showKey; setShowPw(p => ({ ...p, [k]: !p[k] })); }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showPw[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={onClose} disabled={isChanging} className="flex-1 h-11 border border-neutral-300 rounded-xl text-body-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50">
                Hủy
              </button>
              <button type="submit" disabled={isChanging} className="flex-1 h-11 bg-brand-navy text-white rounded-xl text-body-sm font-semibold hover:bg-brand-navy/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {isChanging ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</> : 'Đổi mật khẩu'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Tier Badge ──────────────────────────────────────────────────────────────
function TierBadge({ tier }: { tier: string }) {
  const t = tier?.toUpperCase();
  if (t === 'VIP') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-bold bg-brand-gold/20 text-amber-700 border border-brand-gold/40">
      <Crown className="w-3 h-3" /> VIP
    </span>
  );
  if (t === 'MEMBER') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-bold bg-brand-sage/20 text-brand-sage border border-brand-sage/40">
      <Star className="w-3 h-3" /> Member
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-medium bg-neutral-100 text-neutral-500 border border-neutral-200">
      Free
    </span>
  );
}

// ─── Quota Bar ───────────────────────────────────────────────────────────────
function QuotaBar({ used, limit, unlimited, label }: { used: number; limit: number | null; unlimited?: boolean; label: string }) {
  const pct = unlimited || !limit ? 100 : Math.min((used / limit) * 100, 100);
  const remaining = unlimited ? '∞' : limit !== null ? Math.max(limit - used, 0) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-label-sm text-neutral-500">{label}</span>
        <span className="text-label-sm font-semibold text-neutral-900">
          {unlimited ? '∞ không giới hạn' : `${remaining} còn lại`}
        </span>
      </div>
      <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${unlimited ? 'bg-brand-gold' : pct >= 90 ? 'bg-semantic-error' : pct >= 60 ? 'bg-semantic-warning' : 'bg-semantic-success'}`}
          style={{ width: unlimited ? '100%' : `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Nav Card ────────────────────────────────────────────────────────────────
function NavCard({ href, icon: Icon, label, desc, badge }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string; desc: string; badge?: string }) {
  return (
    <Link href={href} className="group flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-xl hover:border-brand-navy/30 hover:shadow-md transition-all duration-200">
      <div className="w-10 h-10 rounded-xl bg-brand-cream flex items-center justify-center shrink-0 group-hover:bg-brand-navy/10 transition-colors">
        <Icon className="w-5 h-5 text-brand-navy" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-body-sm font-semibold text-neutral-900">{label}</span>
          {badge && <span className="text-label-sm px-1.5 py-0.5 bg-brand-navy text-white rounded-full">{badge}</span>}
        </div>
        <p className="text-label-sm text-neutral-500 mt-0.5">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-brand-navy group-hover:translate-x-0.5 transition-all shrink-0" />
    </Link>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { data: session } = useSession();
  const { currentUser, logout } = useAuth();
  const { measurements } = useMeasurements();
  const { quota: tryOnQuota } = useQuota('TRY_ON');
  const { quota: stylistQuota } = useQuota('STYLIST');
  const [showChangePw, setShowChangePw] = useState(false);

  const user = session?.user;
  const tier = (user?.tier || 'FREE') as string;
  const isOAuth = (user as any)?.provider === 'google';

  const avatarInitial = (user?.name || 'U').charAt(0).toUpperCase();
  const hasMeasurements = measurements && Object.values(measurements).some(v => v != null && v !== 0);

  return (
    <div className="min-h-screen bg-brand-cream pb-24">
      <ChangePasswordModal isOpen={showChangePw} onClose={() => setShowChangePw(false)} />

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">

        {/* ── Hero Card ── */}
        <div className="relative bg-white border border-neutral-200 rounded-2xl p-6 overflow-hidden shadow-sm">
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-brand-navy/5 to-transparent rounded-2xl pointer-events-none" />

          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-navy/70 flex items-center justify-center text-white text-[28px] font-bold shadow-md select-none" style={{ width: 72, height: 72 }}>
                {user?.image
                  ? <img src={user.image} alt="avatar" className="w-full h-full object-cover rounded-2xl" />
                  : avatarInitial
                }
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand-cream border-2 border-white flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-semantic-success" title="Đang hoạt động" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-heading-h2 font-semibold text-neutral-900 truncate">{user?.name || 'Người dùng'}</h1>
                <TierBadge tier={tier} />
              </div>
              <p className="text-body-sm text-neutral-500 truncate mb-3">{user?.email}</p>
              <div className="flex flex-wrap gap-2">
                <Link href="/profile/measurements" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-navy text-white rounded-lg text-label-sm font-medium hover:bg-brand-navy/90 transition-colors">
                  <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa hồ sơ
                </Link>
                {!isOAuth && (
                  <button onClick={() => setShowChangePw(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 rounded-lg text-label-sm font-medium hover:border-brand-navy/30 hover:bg-neutral-50 transition-colors">
                    <Lock className="w-3.5 h-3.5" /> Đổi mật khẩu
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Measurements quick status */}
          <div className={`mt-5 flex items-center gap-2 p-3 rounded-xl text-body-sm ${hasMeasurements ? 'bg-semantic-success/8 text-semantic-success' : 'bg-semantic-warning/8 text-semantic-warning'}`} style={{ backgroundColor: hasMeasurements ? 'rgba(45,122,79,0.07)' : 'rgba(180,83,9,0.07)' }}>
            {hasMeasurements
              ? <><CheckCircle2 className="w-4 h-4 shrink-0" /> <span>Số đo đã được cập nhật — kết quả thử đồ chính xác hơn</span></>
              : <><AlertCircle className="w-4 h-4 shrink-0" /> <span>Chưa có số đo — <Link href="/profile/measurements" className="font-semibold underline underline-offset-2">Thêm ngay</Link> để cải thiện độ chính xác Try-On</span></>
            }
          </div>
        </div>

        {/* ── Quota Overview ── */}
        {tryOnQuota && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-brand-gold" />
              <h2 className="text-body-md font-semibold text-neutral-900">Lượt dùng hôm nay</h2>
            </div>
            <QuotaBar
              used={tryOnQuota.used}
              limit={tryOnQuota.limit}
              unlimited={tryOnQuota.unlimited}
              label="Virtual Try-On"
            />
            {stylistQuota && (
              <QuotaBar
                used={stylistQuota.used}
                limit={stylistQuota.limit}
                unlimited={stylistQuota.unlimited}
                label="AI Stylist"
              />
            )}
            {tier === 'FREE' && (
              <div className="pt-2 border-t border-neutral-100">
                <p className="text-label-sm text-neutral-500">
                  Hoàn thành 1 đơn hàng để nâng lên <span className="font-semibold text-brand-sage">Member</span> — 10 lượt/ngày
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Quick Links ── */}
        <div className="space-y-2">
          <h2 className="text-label-sm font-semibold text-neutral-400 uppercase tracking-wider px-1 mb-3">Tài khoản</h2>
          <NavCard href="/profile/measurements" icon={Ruler} label="Số đo & Hồ sơ" desc="Cập nhật số đo, thông tin cá nhân" badge={!hasMeasurements ? 'Mới' : undefined} />
          <NavCard href="/profile/history" icon={History} label="Lịch sử Try-On" desc="Xem lại và tải ảnh thử đồ AI của bạn" />
          <NavCard href="/profile/stylist-history" icon={Sparkles} label="Lịch sử AI Stylist" desc="Các lần tư vấn phong cách đã thực hiện" />
          <NavCard href="/profile/orders" icon={ShoppingBag} label="Đơn hàng của tôi" desc="Theo dõi và quản lý đơn hàng" />
        </div>

        {/* ── Quick Actions ── */}
        <div className="space-y-2">
          <h2 className="text-label-sm font-semibold text-neutral-400 uppercase tracking-wider px-1 mb-3">Khám phá</h2>
          <NavCard href="/products" icon={Camera} label="Thử đồ mới" desc="Khám phá và thử trang phục công sở" />
          <NavCard href="/ai-stylist" icon={Sparkles} label="Tư vấn phong cách" desc="AI phân tích và gợi ý outfit phù hợp" />
        </div>

        {/* ── Danger Zone ── */}
        <div className="pt-2">
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 py-3 border border-neutral-200 rounded-xl text-body-sm font-medium text-neutral-500 hover:text-semantic-error hover:border-semantic-error/30 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>

      </div>
    </div>
  );
}
