'use client';

import { SectionHeader } from '@/features/measurements/components/section-header';
import { SizeChip } from '@/features/measurements/components/size-chip';
import { SHIRT_SIZE_GUIDE, SHIRT_SIZES, SHOE_SIZES_VN, TROUSER_SIZES } from '@/features/measurements/constants/profile-measurements-page';
import {
  CheckCircle2,
  Save
} from 'lucide-react';
import { useState } from 'react';

export function SizesTab() {
  const [shirt, setShirt] = useState('M');
  const [trouser, setTrouser] = useState('30');
  const [shoe, setShoe] = useState('38');
  const [fitPreference, setFitPreference] = useState<'slim' | 'regular' | 'relaxed'>('regular');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
            {SHIRT_SIZE_GUIDE[shirt] && (
              <div className="flex flex-wrap gap-4 p-4 bg-brand-navy/5 rounded-xl border border-brand-navy/10">
                <div className="text-center">
                  <p className="text-label-sm text-neutral-500">Vòng ngực</p>
                  <p className="text-body-sm font-semibold text-brand-navy mt-0.5">{SHIRT_SIZE_GUIDE[shirt].chest} cm</p>
                </div>
                <div className="w-px bg-neutral-200 self-stretch" />
                <div className="text-center">
                  <p className="text-label-sm text-neutral-500">Vòng eo</p>
                  <p className="text-body-sm font-semibold text-brand-navy mt-0.5">{SHIRT_SIZE_GUIDE[shirt].waist} cm</p>
                </div>
                <div className="w-px bg-neutral-200 self-stretch" />
                <div className="text-center">
                  <p className="text-label-sm text-neutral-500">Vòng hông</p>
                  <p className="text-body-sm font-semibold text-brand-navy mt-0.5">{SHIRT_SIZE_GUIDE[shirt].hip} cm</p>
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
                  className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all ${fitPreference === opt.id
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
