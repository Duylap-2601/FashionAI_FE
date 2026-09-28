'use client';

import { useGhnDistricts, useGhnProvinces, useGhnWards } from '@/features/checkout/hooks/useGhnLocations';
import type { UserAddress, UserAddressInput } from '@/features/profile/types/addresses';
import React, { useEffect, useState } from 'react';

interface AddressFormProps {
  initial?: UserAddress | null;
  isSaving?: boolean;
  onCancel?: () => void;
  onSubmit: (payload: UserAddressInput) => void;
  renderAsForm?: boolean;
}

export function AddressForm({ initial, isSaving, onCancel, onSubmit, renderAsForm = true }: AddressFormProps) {
  const [recipientName, setRecipientName] = useState(initial?.recipientName ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [addressLine, setAddressLine] = useState(initial?.addressLine ?? '');
  const [label, setLabel] = useState(initial?.label ?? '');
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);
  const [provinceId, setProvinceId] = useState<number | ''>(initial?.ghnProvinceId ?? '');
  const [districtId, setDistrictId] = useState<number | ''>(initial?.ghnDistrictId ?? '');
  const [wardCode, setWardCode] = useState(initial?.ghnWardCode ?? '');
  const { provinces, isLoading: loadingProvinces } = useGhnProvinces();
  const { districts, isLoading: loadingDistricts } = useGhnDistricts(provinceId);
  const { wards, isLoading: loadingWards } = useGhnWards(districtId);

  useEffect(() => {
    setRecipientName(initial?.recipientName ?? '');
    setPhone(initial?.phone ?? '');
    setAddressLine(initial?.addressLine ?? '');
    setLabel(initial?.label ?? '');
    setIsDefault(initial?.isDefault ?? false);
    setProvinceId(initial?.ghnProvinceId ?? '');
    setDistrictId(initial?.ghnDistrictId ?? '');
    setWardCode(initial?.ghnWardCode ?? '');
  }, [initial]);

  const submit = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!recipientName.trim() || !phone.trim() || !addressLine.trim() || !provinceId || !districtId || !wardCode) return;
    onSubmit({
      recipientName,
      phone,
      addressLine,
      label: label || undefined,
      ghnProvinceId: provinceId,
      ghnDistrictId: districtId,
      ghnWardCode: wardCode,
      isDefault,
      expectedVersion: initial?.version,
    });
  };

  const Wrapper = renderAsForm ? 'form' : 'div';
  const wrapperProps = renderAsForm ? { onSubmit: submit } : {};

  return (
    <Wrapper {...wrapperProps} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input className="h-11 rounded-xl border border-neutral-200 px-3" placeholder="Người nhận" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} required />
        <input className="h-11 rounded-xl border border-neutral-200 px-3" placeholder="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      <input className="h-11 w-full rounded-xl border border-neutral-200 px-3" placeholder="Số nhà, tên đường" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} required />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select className="h-11 rounded-xl border border-neutral-200 px-3" value={provinceId} onChange={(e) => { setProvinceId(Number(e.target.value) || ''); setDistrictId(''); setWardCode(''); }} required>
          <option value="">{loadingProvinces ? 'Đang tải...' : 'Tỉnh/Thành'}</option>
          {provinces.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select className="h-11 rounded-xl border border-neutral-200 px-3" value={districtId} onChange={(e) => { setDistrictId(Number(e.target.value) || ''); setWardCode(''); }} required disabled={!provinceId}>
          <option value="">{loadingDistricts ? 'Đang tải...' : 'Quận/Huyện'}</option>
          {districts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select className="h-11 rounded-xl border border-neutral-200 px-3" value={wardCode} onChange={(e) => setWardCode(e.target.value)} required disabled={!districtId}>
          <option value="">{loadingWards ? 'Đang tải...' : 'Phường/Xã'}</option>
          {wards.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
        <input className="h-11 rounded-xl border border-neutral-200 px-3" placeholder="Nhãn: Nhà riêng, Văn phòng" value={label} onChange={(e) => setLabel(e.target.value)} />
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} /> Đặt làm mặc định
        </label>
      </div>
      <div className="flex gap-3 justify-end">
        {onCancel && <button type="button" onClick={onCancel} className="h-10 px-4 rounded-xl border border-neutral-200">Hủy</button>}
        <button type={renderAsForm ? 'submit' : 'button'} onClick={renderAsForm ? undefined : () => submit()} disabled={isSaving} className="h-10 px-5 rounded-xl bg-brand-navy text-white font-semibold disabled:opacity-50">{isSaving ? 'Đang lưu...' : 'Lưu địa chỉ'}</button>
      </div>
    </Wrapper>
  );
}
