'use client';

import { usePostMergerProvinces, usePostMergerWards, useShippingCapabilities } from '@/features/checkout/hooks/useGhnLocations';
import type { UserAddress, UserAddressInput } from '@/features/profile/types/addresses';
import { getErrorMessage } from '@/lib/errors';
import { accountButtonClassName, accountInputClassName } from '@/features/profile/components/account-ui';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';
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

  const fieldClass = cn(accountInputClassName, 'bg-landing-paper');
  const labelClass = 'mb-1.5 block text-sm text-landing-obsidian';

  return (
    <Wrapper {...wrapperProps} className="space-y-4 border border-landing-line bg-landing-ivory/60 p-5">
      {hasProvinceError && (
        <div role="alert" className="flex items-start justify-between gap-3 border-l-2 border-destructive bg-landing-paper px-4 py-3 text-xs">
          <div>
            <p className="font-medium text-destructive">Không tải được danh mục Tỉnh/Thành</p>
            <p className="mt-0.5 text-landing-muted">{provinceErrorMessage}</p>
          </div>
          <button
            type="button"
            onClick={handleRetryProvinces}
            disabled={loadingCapability || loadingProvinces}
            className="inline-flex shrink-0 items-center gap-1 font-medium text-landing-oxblood underline underline-offset-4 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${loadingCapability || loadingProvinces ? 'animate-spin' : ''}`} strokeWidth={1.75} aria-hidden="true" />
            Thử lại
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="address-recipient" className={labelClass}>Người nhận</label>
          <input id="address-recipient" autoComplete="name" className={fieldClass} value={recipientName} onChange={(e) => setRecipientName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="address-phone" className={labelClass}>Số điện thoại</label>
          <input id="address-phone" type="tel" inputMode="tel" autoComplete="tel" className={cn(fieldClass, 'font-mono')} value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
      </div>
      <div>
        <label htmlFor="address-line" className={labelClass}>Số nhà, tên đường</label>
        <input id="address-line" autoComplete="address-line1" className={fieldClass} value={addressLine} onChange={(e) => setAddressLine(e.target.value)} required />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="address-province" className={labelClass}>Tỉnh / Thành phố</label>
          <select
            id="address-province"
            className={fieldClass}
            value={provinceId}
            onChange={(e) => {
              setProvinceId(e.target.value);
              setWardId('');
            }}
            required
            disabled={loadingCapability || loadingProvinces || !catalogRevision}
          >
            <option value="">
              {loadingCapability || loadingProvinces
                ? 'Đang tải Tỉnh/Thành…'
                : hasProvinceError
                ? 'Không tải được Tỉnh/Thành'
                : provinces.length === 0
                ? 'Chưa có dữ liệu Tỉnh/Thành'
                : 'Chọn Tỉnh/Thành (sau sáp nhập)'}
            </option>
            {provinces.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="address-ward" className={labelClass}>Phường / Xã</label>
          <select
            id="address-ward"
            className={fieldClass}
            value={wardId}
            onChange={(e) => setWardId(e.target.value)}
            required
            disabled={!provinceId || loadingWards}
          >
            <option value="">
              {loadingWards
                ? 'Đang tải Phường/Xã…'
                : isErrorWards
                ? 'Không tải được Phường/Xã'
                : !provinceId
                ? 'Chọn Tỉnh/Thành trước'
                : wards.length === 0
                ? 'Chưa có dữ liệu Phường/Xã'
                : 'Chọn Phường/Xã'}
            </option>
            {wards.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {isErrorWards && (
            <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-destructive">
              <span>{getErrorMessage(wardsError, 'Không tải được Phường/Xã.')}</span>
              <button type="button" onClick={() => void refetchWards()} className="font-medium underline underline-offset-4">
                Thử lại
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="address-label" className={labelClass}>
            Nhãn <span className="text-landing-muted">(không bắt buộc)</span>
          </label>
          <input id="address-label" className={fieldClass} placeholder="Nhà riêng, Văn phòng" value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <label className="flex h-11 items-center gap-2.5 text-sm text-landing-obsidian">
          <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="h-4 w-4 accent-landing-oxblood" />
          Đặt làm mặc định
        </label>
      </div>
      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} className={accountButtonClassName('outline')}>
            Hủy
          </button>
        )}
        <button type={renderAsForm ? 'submit' : 'button'} onClick={renderAsForm ? undefined : () => submit()} disabled={isSaving} className={accountButtonClassName('primary')}>
          {isSaving ? 'Đang lưu' : 'Lưu địa chỉ'}
        </button>
      </div>
    </Wrapper>
  );
}
