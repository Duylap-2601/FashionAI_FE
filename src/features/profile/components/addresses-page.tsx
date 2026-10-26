'use client';

import { AccountShell } from '@/features/profile/components/account-shell';
import {
  AccountConfirmDialog,
  AccountStatePanel,
  accountButtonClassName,
  accountFocusRing,
} from '@/features/profile/components/account-ui';
import { AddressForm } from '@/features/profile/components/address-form';
import { useAddressMutations, useUserAddresses } from '@/features/profile/hooks/use-addresses';
import type { UserAddress } from '@/features/profile/types/addresses';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const MAX_ADDRESSES = 10;

function formatAddress(address: UserAddress) {
  return [address.addressLine, address.wardName, address.provinceName].filter(Boolean).join(', ');
}

export function AddressesPage() {
  const { data: addresses = [], isLoading, isError, refetch } = useUserAddresses();
  const { createAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddressMutations();
  const [editing, setEditing] = useState<UserAddress | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<UserAddress | null>(null);
  const isSaving = createAddress.isPending || updateAddress.isPending;
  const isFull = addresses.length >= MAX_ADDRESSES;

  const closeForm = () => {
    setEditing(null);
    setShowForm(false);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deleteAddress.mutate(deleting.id, {
      onSuccess: () => {
        toast.success('Đã xoá địa chỉ');
        setDeleting(null);
      },
      onError: (error) => toast.error(getErrorMessage(error, 'Không xoá được địa chỉ')),
    });
  };

  return (
    <AccountShell
      title="Sổ địa chỉ"
      description={`Địa chỉ giao hàng dùng khi đặt may. Lưu tối đa ${MAX_ADDRESSES} địa chỉ, địa chỉ đầu tiên tự thành mặc định.`}
      actions={
        <button
          type="button"
          disabled={isFull}
          onClick={() => { setEditing(null); setShowForm(true); }}
          className={accountButtonClassName('primary')}
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          Thêm địa chỉ
        </button>
      }
    >
      {(showForm || editing) && (
        <section aria-label={editing ? 'Sửa địa chỉ' : 'Địa chỉ mới'} className="mb-8">
          <h2 className="mb-4 font-display text-[1.375rem] leading-tight text-landing-obsidian">{editing ? 'Sửa địa chỉ' : 'Địa chỉ mới'}</h2>
          <AddressForm
            initial={editing}
            isSaving={isSaving}
            onCancel={closeForm}
            onSubmit={(payload) => {
              const mutation = editing ? updateAddress.mutateAsync({ id: editing.id, payload }) : createAddress.mutateAsync(payload);
              mutation
                .then(() => { toast.success('Đã lưu địa chỉ'); closeForm(); })
                .catch((error) => toast.error(getErrorMessage(error, 'Không thể lưu địa chỉ')));
            }}
          />
        </section>
      )}

      {isLoading ? (
        <div className="space-y-3" aria-hidden="true">
          {[0, 1].map((key) => <div key={key} className="h-24 animate-pulse bg-landing-taupe/30" />)}
        </div>
      ) : isError ? (
        <AccountStatePanel
          tone="error"
          title="Không tải được sổ địa chỉ"
          description="Kiểm tra kết nối rồi thử lại."
          action={<button type="button" onClick={() => refetch()} className={accountButtonClassName('outline')}>Thử lại</button>}
        />
      ) : addresses.length === 0 ? (
        !showForm ? (
          <AccountStatePanel
            title="Chưa có địa chỉ nào"
            description="Thêm một địa chỉ để đặt hàng nhanh hơn. Địa chỉ đầu tiên sẽ là mặc định."
            action={<button type="button" onClick={() => setShowForm(true)} className={accountButtonClassName('primary')}>Thêm địa chỉ</button>}
          />
        ) : null
      ) : (
        <>
          <p className="mb-2 text-xs text-landing-muted">
            <span className="font-mono text-landing-obsidian">{addresses.length}/{MAX_ADDRESSES}</span> địa chỉ
          </p>
          <ul className="divide-y divide-landing-line/70 border-y border-landing-line/70">
            {addresses.map((address) => (
              <li key={address.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-medium text-landing-obsidian">{address.recipientName}</span>
                    <span className="font-mono text-sm text-landing-muted">{address.phone}</span>
                    {address.label ? (
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-landing-brass-ink">{address.label}</span>
                    ) : null}
                    {address.isDefault ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-landing-oxblood">
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-landing-oxblood" />
                        Mặc định
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-landing-muted">{formatAddress(address)}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {!address.isDefault ? (
                    <button
                      type="button"
                      disabled={setDefaultAddress.isPending}
                      onClick={() => setDefaultAddress.mutate(address.id, { onError: (error) => toast.error(getErrorMessage(error, 'Không đặt được mặc định')) })}
                      className={cn('mr-2 text-xs text-landing-oxblood underline-offset-4 hover:underline disabled:opacity-50', accountFocusRing)}
                    >
                      Đặt mặc định
                    </button>
                  ) : null}
                  <button type="button" onClick={() => { setEditing(address); setShowForm(false); }} className={accountButtonClassName('outline', 'sm')}>
                    Sửa
                  </button>
                  <button type="button" onClick={() => setDeleting(address)} className={accountButtonClassName('danger', 'sm')}>
                    Xoá
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <AccountConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => { if (!open) setDeleting(null); }}
        title="Xoá địa chỉ này?"
        description={deleting ? `${deleting.recipientName}, ${formatAddress(deleting)}` : ''}
        confirmLabel="Xoá địa chỉ"
        isPending={deleteAddress.isPending}
        onConfirm={confirmDelete}
      />
    </AccountShell>
  );
}
