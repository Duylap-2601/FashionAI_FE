'use client';

import { usePostMergerProvinces, usePostMergerWards, useShippingCapabilities } from '@/features/checkout/hooks/useGhnLocations';
import type { UserAddress, UserAddressInput } from '@/features/profile/types/addresses';
import { getErrorMessage } from '@/lib/errors';
import { AlertCircle, RefreshCw } from 'lucide-react';
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
  const [provinceId, setProvinceId] = useState(initial?.ghnProvinceV3Id ?? '');
  const [wardId, setWardId] = useState(initial?.ghnWardV3Id ?? '');
  const { catalogRevision, isLoading: loadingCapability, isError: isErrorCapability, refetch: refetchCapability } = useShippingCapabilities();
  const {
    provinces,
    isLoading: loadingProvinces,
    isError: isErrorProvinces,
    error: provincesError,
    refetch: refetchProvinces,
  } = usePostMergerProvinces(catalogRevision);
  const {
    wards,
    isLoading: loadingWards,
    isError: isErrorWards,
    error: wardsError,
    refetch: refetchWards,
  } = usePostMergerWards(provinceId, catalogRevision);

  const initialProvinceId = initial?.ghnProvinceV3Id;
  const initialProvinceName = initial?.provinceName;
  const initialWardId = initial?.ghnWardV3Id;
  const initialWardName = initial?.wardName;

  useEffect(() => {
    setRecipientName(initial?.recipientName ?? '');
    setPhone(initial?.phone ?? '');
    setAddressLine(initial?.addressLine ?? '');
    setLabel(initial?.label ?? '');
    setIsDefault(initial?.isDefault ?? false);
    setProvinceId(initial?.ghnProvinceV3Id ?? '');
    setWardId(initial?.ghnWardV3Id ?? '');
  }, [initial]);

  const handleRetryProvinces = () => {
    void refetchCapability();
    void refetchProvinces();
  };

  const submit = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!recipientName.trim() || !phone.trim() || !addressLine.trim() || !provinceId || !wardId) return;
    onSubmit({
      recipientName,
      phone,
      addressLine,
      label: label || undefined,
      ghnProvinceV3Id: provinceId,
      ghnWardV3Id: wardId,
      isDefault,
      expectedVersion: initial?.version,
    });
  };

  const Wrapper = renderAsForm ? 'form' : 'div';
  const wrapperProps = renderAsForm ? { onSubmit: submit } : {};

  const hasProvinceError = isErrorCapability || isErrorProvinces;
  const provinceErrorMessage = hasProvinceError
    ? getErrorMessage(provincesError, 'Danh mục Tỉnh/Thành chưa sẵn sàng hoặc đã hết hạn đồng bộ.')
    : '';

  return (
    <Wrapper {...wrapperProps} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
      {hasProvinceError && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-900">Không thể tải danh mục Tỉnh/Thành</p>
              <p className="text-rose-700 mt-0.5">{provinceErrorMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRetryProvinces}
            disabled={loadingCapability || loadingProvinces}
            className="inline-flex items-center gap-1 font-semibold text-rose-900 underline hover:no-underline shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loadingCapability || loadingProvinces ? 'animate-spin' : ''}`} />
            Thử lại
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input className="h-11 rounded-xl border border-neutral-200 px-3" placeholder="Người nhận" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} required />
        <input className="h-11 rounded-xl border border-neutral-200 px-3" placeholder="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      <input className="h-11 w-full rounded-xl border border-neutral-200 px-3" placeholder="Số nhà, tên đường" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} required />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <select
            className="h-11 w-full rounded-xl border border-neutral-200 px-3 transition-colors disabled:bg-neutral-50 disabled:text-neutral-400"
            value={provinceId}
            onChange={(e) => {
              setProvinceId(e.target.value);
              setWardId('');
            }}
            required
            disabled={loadingCapability || loadingProvinces || (!catalogRevision && !initialProvinceId)}
          >
            <option value="">
              {loadingCapability || loadingProvinces
                ? 'Đang tải Tỉnh/Thành...'
                : hasProvinceError
                ? '⚠️ Không thể tải danh mục Tỉnh/Thành'
                : provinces.length === 0 && !initialProvinceName
                ? 'Chưa có dữ liệu Tỉnh/Thành'
                : 'Tỉnh/Thành sau sáp nhập'}
            </option>
            {initialProvinceId && initialProvinceName && !provinces.some((item) => item.id === initialProvinceId) && (
              <option value={initialProvinceId}>{initialProvinceName}</option>
            )}
            {provinces.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            className="h-11 w-full rounded-xl border border-neutral-200 px-3 transition-colors disabled:bg-neutral-50 disabled:text-neutral-400"
            value={wardId}
            onChange={(e) => setWardId(e.target.value)}
            required
            disabled={!provinceId || loadingWards}
          >
            <option value="">
              {loadingWards
                ? 'Đang tải Phường/Xã...'
                : isErrorWards
                ? '⚠️ Lỗi tải Phường/Xã'
                : !provinceId
                ? 'Chọn Tỉnh/Thành trước'
                : wards.length === 0 && !initialWardName
                ? 'Chưa có dữ liệu Phường/Xã'
                : 'Phường/Xã'}
            </option>
            {initialWardId && initialWardName && !wards.some((item) => item.id === initialWardId) && (
              <option value={initialWardId}>{initialWardName}</option>
            )}
            {wards.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {isErrorWards && (
            <div className="flex items-center justify-between gap-2 mt-1 text-xs text-rose-600">
              <span>{getErrorMessage(wardsError, 'Không tải được Phường/Xã.')}</span>
              <button type="button" onClick={() => void refetchWards()} className="underline hover:no-underline font-medium">
                Thử lại
              </button>
            </div>
          )}
        </div>
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
