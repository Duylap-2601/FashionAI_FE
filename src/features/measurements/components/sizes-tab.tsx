'use client';

import { SHIRT_SIZE_GUIDE, SHIRT_SIZES } from '@/features/measurements/constants/profile-measurements-page';
import { useMeasurements } from '@/features/measurements/hooks/useMeasurements';
import { findClosestShirtSize } from '@/features/measurements/services/size-reference';
import { accountFocusRing, accountLabelClassName } from '@/features/profile/components/account-ui';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const MEASURE_LABELS = { chest: 'vòng ngực', waist: 'vòng eo', hip: 'vòng hông' } as const;

/** Bảng cỡ áo tham khảo; đơn may đo vẫn dùng số đo thật, không dùng cỡ này. */
export function SizesTab() {
  const { measurements, isLoading } = useMeasurements();
  const closest = measurements ? findClosestShirtSize(measurements) : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <p className={accountLabelClassName}>Cỡ gần nhất với số đo đã lưu</p>
          {isLoading ? (
            <div className="mt-3 h-12 w-24 animate-pulse bg-landing-taupe/40" />
          ) : closest ? (
            <>
              <p className="mt-3 font-display text-5xl leading-none text-landing-oxblood">{closest.size}</p>
              <p className="mt-3 max-w-md text-sm text-landing-muted">
                Theo {closest.basedOn.map((key) => MEASURE_LABELS[key]).join(', ')}
                {closest.exact ? '.' : ', số đo của bạn nằm giữa hai cỡ.'} Đơn may đo vẫn may theo số đo thật của bạn.
              </p>
            </>
          ) : (
            <p className="mt-3 max-w-md text-sm text-landing-muted">
              Nhập vòng ngực, vòng eo hoặc vòng hông ở tab Số đo cơ thể để xem cỡ gần nhất.
            </p>
          )}
        </div>
        <Link
          href="/size-guide"
          className={cn('inline-flex min-h-9 items-center gap-1.5 text-sm text-landing-oxblood underline-offset-4 hover:underline', accountFocusRing)}
        >
          Hướng dẫn chọn size
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </div>

      <div className="overflow-x-auto border border-landing-line">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <caption className="sr-only">Bảng cỡ áo tham khảo theo số đo cơ thể (cm)</caption>
          <thead>
            <tr className="border-b border-landing-line bg-landing-ivory/60 text-left">
              {['Cỡ', 'Vòng ngực', 'Vòng eo', 'Vòng hông'].map((heading) => (
                <th key={heading} scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-brass-ink">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SHIRT_SIZES.map((size) => {
              const guide = SHIRT_SIZE_GUIDE[size];
              const isClosest = closest?.size === size;
              return (
                <tr
                  key={size}
                  aria-current={isClosest ? 'true' : undefined}
                  className={cn('border-b border-landing-line/60 last:border-b-0', isClosest && 'bg-landing-oxblood/[0.06]')}
                >
                  <th scope="row" className={cn('px-4 py-3 text-left font-mono', isClosest ? 'text-landing-oxblood' : 'text-landing-obsidian')}>
                    <span className={cn(isClosest && 'border-l-2 border-landing-oxblood pl-2')}>{size}</span>
                  </th>
                  <td className="px-4 py-3 font-mono text-landing-obsidian/85">{guide.chest}</td>
                  <td className="px-4 py-3 font-mono text-landing-obsidian/85">{guide.waist}</td>
                  <td className="px-4 py-3 font-mono text-landing-obsidian/85">{guide.hip}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-landing-muted">Đơn vị: cm. Số đo cơ thể, không phải số đo thành phẩm.</p>
    </div>
  );
}
