'use client';

import { AddressForm } from '@/features/profile/components/address-form';
import { useAddressMutations, useUserAddresses } from '@/features/profile/hooks/use-addresses';
import type { UserAddress } from '@/features/profile/types/addresses';
import { getErrorMessage } from '@/lib/errors';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

function formatAddress(address: UserAddress) {
  return [address.addressLine, address.wardName, address.provinceName].filter(Boolean).join(', ');
}

export function AddressesPage() {
  const { data: addresses = [], isLoading, isError, refetch } = useUserAddresses();
  const { createAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddressMutations();
  const [editing, setEditing] = useState<UserAddress | null>(null);
  const [showForm, setShowForm] = useState(false);
  const isSaving = createAddress.isPending || updateAddress.isPending;

  return (
    <div className="min-h-screen bg-brand-cream px-4 md:px-8 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <Link href="/profile" className="text-sm text-neutral-500 hover:text-brand-navy">&larr; Hồ sơ</Link>
            <h1 className="mt-2 text-2xl font-bold text-brand-navy">Sổ địa chỉ giao hàng</h1>
            <p className="text-sm text-neutral-600">{addresses.length}/10 địa chỉ. Địa chỉ đầu tiên sẽ tự động là mặc định.</p>
          </div>
          <button disabled={addresses.length >= 10} onClick={() => { setEditing(null); setShowForm(true); }} className="h-11 rounded-xl bg-brand-navy px-5 text-white font-semibold disabled:opacity-50">Thêm địa chỉ</button>
        </div>

        {(showForm || editing) && (
          <AddressForm
            initial={editing}
            isSaving={isSaving}
            onCancel={() => { setEditing(null); setShowForm(false); }}
            onSubmit={(payload) => {
              const mutation = editing ? updateAddress.mutateAsync({ id: editing.id, payload }) : createAddress.mutateAsync(payload);
              mutation.then(() => { toast.success('Đã lưu địa chỉ'); setEditing(null); setShowForm(false); }).catch((error) => toast.error(getErrorMessage(error, 'Không thể lưu địa chỉ')));
            }}
          />
        )}

        {isLoading && <div className="rounded-2xl bg-white p-6 text-neutral-500">Đang tải địa chỉ...</div>}
        {isError && <button onClick={() => refetch()} className="rounded-2xl bg-white p-6 text-left text-red-600">Không thể tải địa chỉ. Bấm để thử lại.</button>}
        {!isLoading && !isError && addresses.length === 0 && <div className="rounded-2xl bg-white p-8 text-center text-neutral-500">Bạn chưa có địa chỉ giao hàng.</div>}

        <div className="space-y-3">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-brand-navy">{address.recipientName}</h2>
                    <span className="text-neutral-300">|</span>
                    <span className="text-sm text-neutral-700">{address.phone}</span>
                    {address.label && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">{address.label}</span>}
                    {address.isDefault && <span className="rounded-full bg-brand-navy/10 px-2 py-0.5 text-xs font-semibold text-brand-navy">Mặc định</span>}
                  </div>
                  <p className="mt-2 text-sm text-neutral-700">{formatAddress(address)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!address.isDefault && <button onClick={() => setDefaultAddress.mutate(address.id)} className="text-sm font-semibold text-brand-navy">Đặt mặc định</button>}
                  <button onClick={() => { setEditing(address); setShowForm(false); }} className="text-sm font-semibold text-brand-navy">Sửa</button>
                  <button onClick={() => deleteAddress.mutate(address.id)} className="text-sm font-semibold text-red-600">Xóa</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
