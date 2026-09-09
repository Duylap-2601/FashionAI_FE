'use client';

import { VIETNAM_PROVINCES } from '@/features/checkout/constants/vietnam-provinces';
import type { ShippingAddressFormProps } from '@/features/checkout/types/shipping-address-form';

export function ShippingAddressForm({ fullName, setFullName, phone, setPhone, addressDetail, setAddressDetail, provinceId, setProvinceId, setDistrictId, districtId, availableDistricts, notes, setNotes }: ShippingAddressFormProps) {
  return (
    <section>
      <h2 className="text-[20px] font-bold text-brand-navy mb-6">Thông tin giao hàng</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-body-sm font-medium text-brand-navy mb-1.5">Họ và tên *</label>
          <input required type="text" placeholder="Nguyễn Văn A" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full h-[48px] px-4 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-all" />
        </div>
        <div>
          <label className="block text-body-sm font-medium text-brand-navy mb-1.5">Số điện thoại *</label>
          <input required type="tel" placeholder="090 123 4567" value={phone} onChange={e => setPhone(e.target.value)} className="w-full h-[48px] px-4 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-all" />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-body-sm font-medium text-brand-navy mb-1.5">Địa chỉ chi tiết *</label>
        <input required type="text" placeholder="Số nhà, Tên đường, Phường/Xã..." value={addressDetail} onChange={e => setAddressDetail(e.target.value)} className="w-full h-[48px] px-4 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-all" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-body-sm font-medium text-brand-navy mb-1.5">Tỉnh/Thành phố *</label>
          <select
            required
            value={provinceId}
            onChange={e => {
              const newProvId = e.target.value;
              setProvinceId(newProvId);
              const prov = VIETNAM_PROVINCES.find(p => p.id === newProvId);
              if (prov && prov.districts.length > 0) {
                setDistrictId(prov.districts[0].id);
              }
            }}
            className="w-full h-[48px] px-4 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-all cursor-pointer"
          >
            {VIETNAM_PROVINCES.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-body-sm font-medium text-brand-navy mb-1.5">Quận/Huyện *</label>
          <select
            required
            value={districtId}
            onChange={e => setDistrictId(e.target.value)}
            className="w-full h-[48px] px-4 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-all cursor-pointer"
          >
            {availableDistricts.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-body-sm font-medium text-brand-navy mb-1.5">Ghi chú cho người giao hàng</label>
        <textarea rows={3} placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..." value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-4 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-all resize-none"></textarea>
      </div>
    </section>
  );
}
