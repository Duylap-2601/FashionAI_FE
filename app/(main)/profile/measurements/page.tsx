'use client';

import React, { useState, useEffect } from 'react';
import {
  User, Ruler, Camera, Package, Lock, CheckCircle2,
  AlertCircle, Sparkles, Info, Edit3, Save, X,
  ChevronRight, Phone, Mail, Calendar, MapPin,
  Shirt, ArrowUpDown, Weight
} from 'lucide-react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMeasurements, useUserProfile } from '@/hooks/useMeasurements';
import { useQuota } from '@/hooks/useQuota';

// ─── Types ────────────────────────────────────────────────────────────────────
type BodyType = 'slim' | 'regular' | 'athletic' | 'plus';
type Gender = 'male' | 'female' | 'other';
type Tab = 'profile' | 'measurements' | 'sizes';

interface MeasurementField {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  desc: string;
  requiredFor?: string;
  svgY?: string | null;
}

// ─── Field Definitions ────────────────────────────────────────────────────────
const UPPER_FIELDS: MeasurementField[] = [
  { id: 'shoulder', label: 'Rộng vai', unit: 'cm', min: 30, max: 70, desc: 'Từ đầu vai trái đến vai phải', requiredFor: 'Áo & Đồ liền', svgY: '22%' },
  { id: 'chest', label: 'Vòng ngực', unit: 'cm', min: 60, max: 140, desc: 'Vòng lớn nhất của ngực', requiredFor: 'Áo & Đồ liền', svgY: '31%' },
  { id: 'shirtLength', label: 'Dài thân áo', unit: 'cm', min: 50, max: 85, desc: 'Từ điểm vai đến lai áo', requiredFor: 'Áo & Đồ liền', svgY: null },
  { id: 'sleeveLength', label: 'Dài tay áo', unit: 'cm', min: 45, max: 80, desc: 'Từ vai đến cổ tay', requiredFor: 'Áo', svgY: null },
  { id: 'neck', label: 'Vòng cổ', unit: 'cm', min: 28, max: 55, desc: 'Vòng quanh cổ, cách cổ áo 2cm', svgY: '14%' },
  { id: 'underbust', label: 'Vòng ngực dưới', unit: 'cm', min: 55, max: 130, desc: 'Ngay dưới ngực (dành cho nữ)', svgY: null },
  { id: 'wrist', label: 'Vòng cổ tay', unit: 'cm', min: 12, max: 25, desc: 'Vòng quanh cổ tay', svgY: null },
];

const LOWER_FIELDS: MeasurementField[] = [
  { id: 'waist', label: 'Vòng eo', unit: 'cm', min: 50, max: 130, desc: 'Phần thắt nhỏ nhất của eo', requiredFor: 'Quần & Váy', svgY: '45%' },
  { id: 'hip', label: 'Vòng hông', unit: 'cm', min: 60, max: 145, desc: 'Vòng lớn nhất của mông', requiredFor: 'Quần & Váy', svgY: '55%' },
  { id: 'outseam', label: 'Dài quần', unit: 'cm', min: 80, max: 120, desc: 'Từ cạp xuống gấu quần', requiredFor: 'Quần & Váy', svgY: null },
  { id: 'thigh', label: 'Vòng đùi', unit: 'cm', min: 35, max: 90, desc: 'Vòng lớn nhất của đùi', requiredFor: 'Quần & Váy', svgY: '63%' },
  { id: 'inseam', label: 'Dài đũng quần', unit: 'cm', min: 55, max: 95, desc: 'Từ đũng quần đến mắt cá chân', svgY: null },
  { id: 'knee', label: 'Vòng đầu gối', unit: 'cm', min: 25, max: 55, desc: 'Vòng quanh đầu gối', svgY: null },
  { id: 'calf', label: 'Vòng bắp chân', unit: 'cm', min: 25, max: 55, desc: 'Vòng lớn nhất của bắp chân', svgY: null },
];

const OVERVIEW_FIELDS: MeasurementField[] = [
  { id: 'height', label: 'Chiều cao', unit: 'cm', min: 130, max: 220, desc: 'Từ gót chân đến đỉnh đầu', requiredFor: 'Bắt buộc tất cả' },
  { id: 'weight', label: 'Cân nặng', unit: 'kg', min: 35, max: 150, desc: 'Cân nặng cơ thể' },
];

const allMeasurementFields = [...OVERVIEW_FIELDS, ...UPPER_FIELDS, ...LOWER_FIELDS];

function validate(id: string, value: string, allFields: MeasurementField[]): boolean | null {
  if (!value) return null;
  const num = parseFloat(value);
  const field = allFields.find(f => f.id === id);
  if (!field || isNaN(num)) return false;
  return num >= field.min && num <= field.max;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function MeasurementInput({
  field,
  value,
  initialValue,
  onChange,
}: {
  field: MeasurementField;
  value: string;
  initialValue: string;
  onChange: (v: string) => void;
}) {
  const isValid = validate(field.id, value, allMeasurementFields);
  const isDirty = value !== initialValue;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <label className="text-label-md font-medium text-neutral-800 flex items-center gap-1.5 flex-wrap">
          <span>{field.label}</span>
          {field.requiredFor && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-navy/10 text-brand-navy">
              {field.requiredFor}
            </span>
          )}
          {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />}
        </label>
        <span className="text-label-sm text-neutral-400 text-right truncate">{field.desc}</span>
      </div>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="—"
          className={`w-full pl-3 pr-12 py-2.5 rounded-lg border text-body-md bg-white transition-colors focus:outline-none focus:ring-2
            ${isValid === false
              ? 'border-semantic-error focus:ring-semantic-error/20 focus:border-semantic-error'
              : isValid === true
              ? 'border-semantic-success focus:ring-semantic-success/20 focus:border-semantic-success'
              : 'border-neutral-300 focus:ring-brand-navy/20 focus:border-brand-navy'
            }`}
        />
        <div className="absolute inset-y-0 right-3 flex items-center gap-1.5 pointer-events-none">
          {isValid === true && <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success" />}
          {isValid === false && <AlertCircle className="w-3.5 h-3.5 text-semantic-error" />}
          <span className="text-neutral-400 text-body-sm font-medium">{field.unit}</span>
        </div>
      </div>
      <p className="mt-1 text-label-sm text-neutral-400">
        {isValid === false ? `Phải từ ${field.min}–${field.max} ${field.unit}` : `${field.min}–${field.max} ${field.unit}`}
      </p>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="flex-1">
        <h3 className="text-body-lg font-semibold text-neutral-900">{title}</h3>
        {subtitle && <p className="text-body-sm text-neutral-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="h-px flex-1 bg-neutral-100 self-center ml-4 mt-1" />
    </div>
  );
}

function BodyDiagram({ values, gender }: { values: Record<string, string>; gender: Gender }) {
  const filledPoints = [
    { id: 'neck', label: 'Cổ', y: '13%' },
    { id: 'shoulder', label: 'Vai', y: '22%' },
    { id: 'chest', label: 'Ngực', y: '31%' },
    { id: 'waist', label: 'Eo', y: '45%' },
    { id: 'hip', label: 'Hông', y: '55%' },
    { id: 'thigh', label: 'Đùi', y: '63%' },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[180px]" style={{ height: 380 }}>
        <svg viewBox="0 0 200 420" className="w-full h-full" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="100" cy="50" rx="19" ry="21" fill="#EEF2FF" stroke="#A5B4FC" strokeWidth="2" />
          <path d="M91,70 L91,82 M109,70 L109,82" stroke="#A5B4FC" strokeWidth="2" />
          <path
            d="M91,82 C68,84 57,98 57,114 L62,196 L84,196 L79,228 L121,228 L116,196 L138,196 L143,114 C143,98 132,84 109,82 Z"
            fill="#EEF2FF" stroke="#A5B4FC" strokeWidth="2"
          />
          <path d="M57,114 L42,212 L54,212" stroke="#A5B4FC" strokeWidth="2" fill="none" />
          <path d="M143,114 L158,212 L146,212" stroke="#A5B4FC" strokeWidth="2" fill="none" />
          <path d="M79,228 L73,385 L96,385 L100,295 L104,385 L127,385 L121,228 Z" fill="#EEF2FF" stroke="#A5B4FC" strokeWidth="2" />
          <line x1="100" y1="84" x2="100" y2="225" stroke="#C7D2FE" strokeWidth="1" strokeDasharray="4 3" />
          <line x1="57" y1="190" x2="143" y2="190" stroke="#FCD34D" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
        </svg>

        {filledPoints.map(point => {
          const filled = !!values[point.id];
          return (
            <div
              key={point.id}
              className="absolute flex items-center gap-1.5 left-0 right-0"
              style={{ top: point.y, justifyContent: 'flex-end', paddingRight: '12px' }}
            >
              <span className={`text-[10px] font-medium ${filled ? 'text-brand-navy' : 'text-neutral-400'}`}>
                {point.label}
              </span>
              <div className={`w-2.5 h-2.5 rounded-full border-2 border-white shadow transition-colors ${
                filled ? 'bg-brand-navy' : 'bg-neutral-300'
              }`} />
            </div>
          );
        })}
      </div>

      <div className="w-full mt-4 px-2">
        {(() => {
          const keyFields = ['height', 'weight', 'shoulder', 'chest', 'waist', 'hip', 'inseam'];
          const filled = keyFields.filter(k => !!values[k]).length;
          const pct = Math.round((filled / keyFields.length) * 100);
          return (
            <>
              <div className="flex justify-between mb-1.5">
                <span className="text-label-sm text-neutral-500">Độ hoàn thiện</span>
                <span className="text-label-sm font-semibold text-brand-navy">{pct}%</span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-navy rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-label-sm text-neutral-400 mt-2 text-center">
                {filled}/{keyFields.length} số đo cơ bản
              </p>
            </>
          );
        })()}
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({
  activeTab,
  setActiveTab,
  userName,
  userEmail,
  userTier,
}: {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  userName: string;
  userEmail: string;
  userTier: string;
}) {
  const { quota } = useQuota();

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: <User className="w-4 h-4" /> },
    { id: 'measurements', label: 'Số đo cơ thể', icon: <Ruler className="w-4 h-4" /> },
    { id: 'sizes', label: 'Cỡ tham khảo', icon: <Shirt className="w-4 h-4" /> },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(-2)
      .map(part => part[0])
      .join('')
      .toUpperCase() || 'US';
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'admin': return 'Administrator';
      case 'vip': return 'VIP Member';
      case 'member': return 'Gold Member';
      default: return 'Free Account';
    }
  };

  const quotaPercent = quota && quota.limit !== null ? Math.min(100, Math.round((quota.used / quota.limit) * 100)) : 0;

  return (
    <aside className="w-full md:w-[240px] shrink-0 flex flex-col gap-3">
      {/* Avatar card */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 flex flex-col items-center text-center">
        <div className="relative mb-3">
          <div className="w-16 h-16 bg-brand-navy/10 text-brand-navy rounded-full flex items-center justify-center text-heading-h3 font-bold">
            {getInitials(userName)}
          </div>
        </div>
        <h2 className="text-body-md font-semibold text-neutral-900">{userName}</h2>
        <p className="text-label-sm text-neutral-500 mt-0.5">{userEmail}</p>
        <div className="mt-3 bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase">
          {getTierLabel(userTier)}
        </div>
      </div>

      {/* Nav */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-2 flex flex-col gap-0.5">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm font-medium transition-colors text-left w-full ${
              activeTab === item.id
                ? 'bg-brand-navy/8 text-brand-navy'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {activeTab === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand-navy rounded-r-full" />
            )}
            {item.icon}
            {item.label}
          </button>
        ))}

        <div className="h-px bg-neutral-100 my-1" />

        <Link href="/profile/history" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
          <Camera className="w-4 h-4" /> Lịch sử Try-On
        </Link>
        <Link href="/profile/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
          <Package className="w-4 h-4" /> Đơn hàng
        </Link>
      </div>

      {/* Quota */}
      {quota && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
          <p className="text-label-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">Try-On hôm nay</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-body-sm text-neutral-700">Đã dùng</span>
            <span className="text-body-sm font-bold text-brand-navy">
              {quota.limit === null ? `${quota.used} / Không giới hạn` : `${quota.used} / ${quota.limit} lượt`}
            </span>
          </div>
          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-navy rounded-full transition-all" style={{ width: `${quotaPercent}%` }} />
          </div>
          <p className="text-label-sm text-neutral-400 mt-2">Reset lúc 00:00 hằng ngày</p>
        </div>
      )}
    </aside>
  );
}

// ─── Tab: Thông tin cá nhân ───────────────────────────────────────────────────
function ProfileTab() {
  const { profile, isLoading, updateProfile, isUpdating } = useUserProfile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    birthday: '',
    gender: 'female' as Gender,
    address: '',
    city: '',
    job: '',
    company: '',
  });

  const prefillDone = React.useRef(false);
  useEffect(() => {
    if (prefillDone.current) return;
    if (profile?.name || profile?.email) {
      prefillDone.current = true;
      setForm({
        fullName: profile.name || '',
        phone: profile.phone || '',
        email: profile.email || '',
        birthday: profile.birthday || '',
        gender: (profile.gender || 'female') as Gender,
        address: profile.address || '',
        city: profile.city || '',
        job: profile.job || '',
        company: profile.company || '',
      });
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile({
      name: form.fullName,
      phone: form.phone,
      birthday: form.birthday,
      gender: form.gender,
      address: form.address,
      city: form.city,
      job: form.job,
      company: form.company,
    }, {
      onSuccess: () => {
        setEditing(false);
      }
    });
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        fullName: profile.name || '',
        phone: profile.phone || '',
        email: profile.email || '',
        birthday: profile.birthday || '',
        gender: (profile.gender || 'female') as Gender,
        address: profile.address || '',
        city: profile.city || '',
        job: profile.job || '',
        company: profile.company || '',
      });
    }
    setEditing(false);
  };

  const Field = ({
    label, icon, value, field, type = 'text', placeholder
  }: {
    label: string;
    icon: React.ReactNode;
    value: string;
    field: keyof typeof form;
    type?: string;
    placeholder?: string;
  }) => (
    <div>
      <label className="text-label-sm font-medium text-neutral-500 mb-1.5 flex items-center gap-1.5">
        {icon} {label}
      </label>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20 focus:outline-none text-body-md bg-white"
        />
      ) : (
        <p className="text-body-md text-neutral-900 py-2.5 border-b border-neutral-100">{value || '—'}</p>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 flex justify-center items-center h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="px-6 md:px-8 py-5 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <h2 className="text-heading-h3 font-semibold text-neutral-900">Thông tin cá nhân</h2>
          <p className="text-body-sm text-neutral-500 mt-0.5">Thông tin hiển thị và dùng cho đơn hàng</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-label-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleCancel} className="px-4 py-2 border border-neutral-200 rounded-lg text-label-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
              Hủy
            </button>
            <button onClick={handleSave} disabled={isUpdating} className="flex items-center gap-1.5 px-4 py-2 bg-brand-navy text-white rounded-lg text-label-sm font-semibold hover:bg-brand-navy/90 transition-colors disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {isUpdating ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 flex flex-col gap-8">
        <div>
          <SectionHeader title="Thông tin cơ bản" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Họ và tên" icon={<User className="w-3.5 h-3.5" />} value={form.fullName} field="fullName" placeholder="Nguyễn Văn A" />
            <Field label="Số điện thoại" icon={<Phone className="w-3.5 h-3.5" />} value={form.phone} field="phone" type="tel" placeholder="09xx xxx xxx" />
            <Field label="Email (Không thể thay đổi)" icon={<Mail className="w-3.5 h-3.5" />} value={form.email} field="email" type="email" placeholder="email@example.com" />
            <Field label="Ngày sinh" icon={<Calendar className="w-3.5 h-3.5" />} value={form.birthday} field="birthday" type="date" />
          </div>

          <div className="mt-5">
            <label className="text-label-sm font-medium text-neutral-500 mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Giới tính
            </label>
            <div className="flex gap-3">
              {([
                { v: 'female', l: 'Nữ' },
                { v: 'male', l: 'Nam' },
                { v: 'other', l: 'Khác' },
              ] as { v: Gender; l: string }[]).map(opt => (
                <button
                  key={opt.v}
                  disabled={!editing}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, gender: opt.v }))}
                  className={`px-5 py-2 rounded-lg border text-label-sm font-medium transition-colors ${
                    form.gender === opt.v
                      ? 'bg-brand-navy text-white border-brand-navy'
                      : 'border-neutral-300 text-neutral-600 hover:border-brand-navy/40'
                  } ${!editing ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <SectionHeader title="Nghề nghiệp" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Chức danh" icon={<User className="w-3.5 h-3.5" />} value={form.job} field="job" placeholder="Senior Manager" />
            <Field label="Công ty" icon={<User className="w-3.5 h-3.5" />} value={form.company} field="company" placeholder="Tên công ty" />
          </div>
        </div>

        <div>
          <SectionHeader title="Địa chỉ giao hàng" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Field label="Địa chỉ" icon={<MapPin className="w-3.5 h-3.5" />} value={form.address} field="address" placeholder="Số nhà, đường, phường/xã" />
            </div>
            <Field label="Tỉnh / Thành phố" icon={<MapPin className="w-3.5 h-3.5" />} value={form.city} field="city" placeholder="Hồ Chí Minh" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Số đo cơ thể ────────────────────────────────────────────────────────
function MeasurementsTab() {
  const { measurements, isLoading, updateMeasurements, isUpdating } = useMeasurements();
  const queryClient = useQueryClient();

  const [initialValues, setInitialValues] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [bodyType, setBodyType] = useState<BodyType>('regular');
  const [gender, setGender] = useState<Gender>('female');

  const prefillDone = React.useRef(false);
  useEffect(() => {
    if (prefillDone.current) return;
    if (measurements && Object.keys(measurements).length > 0) {
      prefillDone.current = true;
      const validFieldIds = new Set(allMeasurementFields.map(f => f.id));
      const formatted: Record<string, string> = {};
      Object.entries(measurements).forEach(([k, v]) => {
        if (validFieldIds.has(k) && v !== undefined && v !== null) {
          formatted[k] = String(v);
        }
      });
      // Handle alias mapping
      if (!formatted.shirtLength && (measurements as any).bodyLength) {
        formatted.shirtLength = String((measurements as any).bodyLength);
      }
      if (!formatted.outseam && (measurements as any).trouserLength) {
        formatted.outseam = String((measurements as any).trouserLength);
      }

      setInitialValues(formatted);
      setValues(formatted);
    }
  }, [measurements]);

  const isDirty = allMeasurementFields.some(f => (values[f.id] || '') !== (initialValues[f.id] || ''));
  const allValid = allMeasurementFields.every(f => {
    const val = values[f.id];
    if (!val || String(val).trim() === '') return true;
    return validate(f.id, String(val), allMeasurementFields) === true;
  });

  const set = (id: string, v: string) => setValues(p => ({ ...p, [id]: v }));

  const handleSave = () => {
    if (!allValid) {
      toast.error('Vui lòng kiểm tra lại các số đo chưa hợp lệ');
      return;
    }
    const validFieldIds = new Set(allMeasurementFields.map(f => f.id));
    const body: Record<string, number> = {};
    Object.entries(values).forEach(([k, v]) => {
      if (validFieldIds.has(k) && v !== undefined && v !== '' && !isNaN(parseFloat(v))) {
        body[k] = parseFloat(v);
      }
    });

    // Provide aliases for backwards compatibility
    if (body.shirtLength !== undefined) body.bodyLength = body.shirtLength;
    if (body.outseam !== undefined) body.trouserLength = body.outseam;

    updateMeasurements(body, {
      onSuccess: () => {
        toast.success('Đã lưu số đo cơ thể thành công!');
        setInitialValues({ ...values });
        queryClient.invalidateQueries({ queryKey: ['measurements-completeness'] });
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || 'Không thể lưu số đo.';
        toast.error(`Lỗi: ${Array.isArray(msg) ? msg[0] : msg}`);
      }
    });
  };

  const bodyTypes: { id: BodyType; label: string; desc: string }[] = [
    { id: 'slim', label: 'Mảnh mai', desc: 'Vai hẹp, eo thon' },
    { id: 'regular', label: 'Cân đối', desc: 'Tỷ lệ hài hòa' },
    { id: 'athletic', label: 'Thể thao', desc: 'Vai rộng, cơ bắp' },
    { id: 'plus', label: 'Plus size', desc: 'Dáng đầy đặn' },
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 flex justify-center items-center h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {isDirty && (
        <div className="sticky top-[72px] z-20 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 text-amber-700 text-label-sm font-medium">
            <AlertCircle className="w-4 h-4" /> Bạn có thay đổi chưa lưu
          </div>
          <div className="flex gap-2">
            <button onClick={() => setValues({ ...initialValues })} className="px-3 py-1.5 text-label-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Hủy</button>
            <button onClick={handleSave} disabled={!allValid || isUpdating} className="px-4 py-1.5 bg-brand-navy text-white rounded-lg text-label-sm font-medium hover:bg-brand-navy/90 transition-colors disabled:opacity-50">Lưu</button>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
        <Info className="w-4 h-4 text-semantic-info shrink-0 mt-0.5" />
        <p className="text-body-sm text-blue-700">Dùng thước dây mềm, đo sát người nhưng không siết. Nhờ người khác đo giúp sẽ cho kết quả chính xác hơn.</p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 md:px-8 py-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-heading-h3 font-semibold text-neutral-900">Số đo cơ thể</h2>
            <p className="text-body-sm text-neutral-500 mt-0.5">Giúp AI thử đồ chính xác và gợi ý size phù hợp</p>
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Sticky Visual Side */}
          <div className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-[88px]">
            <div className="bg-neutral-50 rounded-xl border border-neutral-100 p-5 flex flex-col items-center">
              <BodyDiagram values={values} gender={gender} />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-8">
            <div>
              <SectionHeader title="Tổng quan" subtitle="Thông tin cơ bản về cơ thể" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {OVERVIEW_FIELDS.map(f => (
                  <MeasurementInput
                    key={f.id}
                    field={f}
                    value={values[f.id] || ''}
                    initialValue={initialValues[f.id] || ''}
                    onChange={v => set(f.id, v)}
                  />
                ))}
              </div>
            </div>

            <div>
              <SectionHeader title="Dáng người" subtitle="Giúp AI tối ưu kết quả thử đồ" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {bodyTypes.map(bt => (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() => setBodyType(bt.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                      bodyType === bt.id
                        ? 'border-brand-navy bg-brand-navy/5'
                        : 'border-neutral-200 hover:border-brand-navy/30 bg-white'
                    }`}
                  >
                    <span className={`text-label-md font-semibold ${bodyType === bt.id ? 'text-brand-navy' : 'text-neutral-700'}`}>
                      {bt.label}
                    </span>
                    <span className="text-label-sm text-neutral-500">{bt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <SectionHeader title="Thân trên" subtitle="Áo sơ mi, blazer, vest" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {UPPER_FIELDS.map(f => (
                  <MeasurementInput
                    key={f.id}
                    field={f}
                    value={values[f.id] || ''}
                    initialValue={initialValues[f.id] || ''}
                    onChange={v => set(f.id, v)}
                  />
                ))}
              </div>
            </div>

            <div>
              <SectionHeader title="Thân dưới" subtitle="Quần tây, chân váy" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {LOWER_FIELDS.map(f => (
                  <MeasurementInput
                    key={f.id}
                    field={f}
                    value={values[f.id] || ''}
                    initialValue={initialValues[f.id] || ''}
                    onChange={v => set(f.id, v)}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-5 border-t border-neutral-100">
              <button
                onClick={handleSave}
                disabled={!isDirty || !allValid || isUpdating}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-label-md font-semibold transition-all ${
                  isDirty && allValid
                    ? 'bg-brand-navy text-white hover:bg-brand-navy/90 shadow-md'
                    : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" /> {isUpdating ? 'Đang lưu số đo...' : 'Lưu số đo'}
              </button>
              {isDirty && (
                <button
                  onClick={() => setValues({ ...initialValues })}
                  className="px-6 py-2.5 rounded-xl text-label-md font-medium border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                  Hủy
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Cỡ tham khảo ───────────────────────────────────────────────────────
const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const TROUSER_SIZES = ['28', '29', '30', '31', '32', '33', '34', '36'];
const SHOE_SIZES_VN = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'];

function SizeChip({
  label, selected, onClick
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`px-4 py-2 rounded-lg border text-label-md font-medium transition-all ${
        selected
          ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
          : 'border-neutral-200 text-neutral-600 hover:border-brand-navy/40 bg-white'
      }`}
    >
      {label}
    </button>
  );
}

function SizesTab() {
  const [shirt, setShirt] = useState('M');
  const [trouser, setTrouser] = useState('30');
  const [shoe, setShoe] = useState('38');
  const [fitPreference, setFitPreference] = useState<'slim' | 'regular' | 'relaxed'>('regular');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sizeGuide: Record<string, { chest: string; waist: string; hip: string }> = {
    XS: { chest: '80–84', waist: '63–67', hip: '86–90' },
    S:  { chest: '84–88', waist: '67–71', hip: '90–94' },
    M:  { chest: '88–92', waist: '71–75', hip: '94–98' },
    L:  { chest: '92–96', waist: '75–79', hip: '98–102' },
    XL: { chest: '96–100', waist: '79–83', hip: '102–106' },
    XXL: { chest: '100–106', waist: '83–89', hip: '106–112' },
    '3XL': { chest: '106–112', waist: '89–95', hip: '112–118' },
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 md:px-8 py-5 border-b border-neutral-100">
          <h2 className="text-heading-h3 font-semibold text-neutral-900">Cỡ tham khảo</h2>
          <p className="text-body-sm text-neutral-500 mt-0.5">Kết hợp với số đo để gợi ý size chính xác hơn</p>
        </div>

        <div className="p-6 md:p-8 flex flex-col gap-8">
          <div>
            <SectionHeader title="Size áo" subtitle="Áo sơ mi, blazer, vest" />
            <div className="flex flex-wrap gap-2 mb-4">
              {SHIRT_SIZES.map(s => (
                <SizeChip key={s} label={s} selected={shirt === s} onClick={() => setShirt(s)} />
              ))}
            </div>
            {sizeGuide[shirt] && (
              <div className="flex flex-wrap gap-4 p-4 bg-brand-navy/5 rounded-xl border border-brand-navy/10">
                <div className="text-center">
                  <p className="text-label-sm text-neutral-500">Vòng ngực</p>
                  <p className="text-body-sm font-semibold text-brand-navy mt-0.5">{sizeGuide[shirt].chest} cm</p>
                </div>
                <div className="w-px bg-neutral-200 self-stretch" />
                <div className="text-center">
                  <p className="text-label-sm text-neutral-500">Vòng eo</p>
                  <p className="text-body-sm font-semibold text-brand-navy mt-0.5">{sizeGuide[shirt].waist} cm</p>
                </div>
                <div className="w-px bg-neutral-200 self-stretch" />
                <div className="text-center">
                  <p className="text-label-sm text-neutral-500">Vòng hông</p>
                  <p className="text-body-sm font-semibold text-brand-navy mt-0.5">{sizeGuide[shirt].hip} cm</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <SectionHeader title="Kiểu dáng ưa thích" subtitle="Ảnh hưởng đến gợi ý size" />
            <div className="grid grid-cols-3 gap-3">
              {([
                { id: 'slim', label: 'Slim Fit', desc: 'Ôm sát người' },
                { id: 'regular', label: 'Regular Fit', desc: 'Vừa vặn chuẩn' },
                { id: 'relaxed', label: 'Relaxed Fit', desc: 'Rộng thoải mái' },
              ] as { id: 'slim' | 'regular' | 'relaxed'; label: string; desc: string }[]).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFitPreference(opt.id)}
                  className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all ${
                    fitPreference === opt.id
                      ? 'border-brand-navy bg-brand-navy/5'
                      : 'border-neutral-200 hover:border-brand-navy/30'
                  }`}
                >
                  <span className={`text-label-md font-semibold ${fitPreference === opt.id ? 'text-brand-navy' : 'text-neutral-700'}`}>
                    {opt.label}
                  </span>
                  <span className="text-label-sm text-neutral-500">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader title="Size quần" subtitle="Quần tây, quần âu (số inch eo)" />
            <div className="flex flex-wrap gap-2">
              {TROUSER_SIZES.map(s => (
                <SizeChip key={s} label={s} selected={trouser === s} onClick={() => setTrouser(s)} />
              ))}
            </div>
          </div>

          <div>
            <SectionHeader title="Cỡ giày" subtitle="Cỡ Việt Nam" />
            <div className="flex flex-wrap gap-2">
              {SHOE_SIZES_VN.map(s => (
                <SizeChip key={s} label={s} selected={shoe === s} onClick={() => setShoe(s)} />
              ))}
            </div>
          </div>

          <div>
            <SectionHeader title="Ghi chú phong cách" subtitle="Yêu cầu đặc biệt khi mua hoặc gợi ý" />
            <textarea
              rows={3}
              placeholder="Ví dụ: Thích màu trung tính, không dùng vải len, ưu tiên chất liệu thoáng mát..."
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20 focus:outline-none text-body-md bg-white resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-5 border-t border-neutral-100">
            <button
              onClick={handleSave}
              type="button"
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-navy text-white rounded-xl text-label-md font-semibold hover:bg-brand-navy/90 transition-all shadow-md"
            >
              {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Đã lưu!' : 'Lưu cỡ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Measurements() {
  const [activeTab, setActiveTab] = useState<Tab>('measurements');
  // Lấy name từ API /users/me (đúng UTF-8) thay vì session (bị mojibake)
  const { profile } = useUserProfile();

  const userName = profile?.name || '';
  const userEmail = profile?.email || '';
  const userTier = (profile as any)?.tier || 'free';

  return (
    <div className="min-h-screen bg-brand-cream pb-16 md:pb-12">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-heading-h2 font-bold text-brand-navy">Hồ sơ & Số đo</h1>
          <p className="text-body-sm text-neutral-500 mt-1">Quản lý thông tin cá nhân và số đo cơ thể của bạn</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userName={userName}
            userEmail={userEmail}
            userTier={userTier}
          />

          <main className="flex-1 min-w-0">
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'measurements' && <MeasurementsTab />}
            {activeTab === 'sizes' && <SizesTab />}
          </main>
        </div>
      </div>
    </div>
  );
}
