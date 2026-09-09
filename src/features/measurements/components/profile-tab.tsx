'use client';

import { SectionHeader } from '@/features/measurements/components/section-header';
import type { Gender } from '@/features/measurements/types/profile-measurements-page';
import { useUserProfile } from '@/features/profile/hooks/use-profile';
import {
  Calendar,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Save,
  User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

export function ProfileTab() {
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
            <Field
              label="Email (Không thể thay đổi)"
              icon={<Mail className="w-3.5 h-3.5" />}
              value={form.email}
              field="email"
              type="email"
              placeholder="email@example.com"
            />
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
                  className={`px-5 py-2 rounded-lg border text-label-sm font-medium transition-colors ${form.gender === opt.v
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
