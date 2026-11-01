import type { RefundEvidence } from '@/features/orders/types/orders';
import { getRefundEvidenceImages } from '@/lib/utils';
import Image from 'next/image';

interface RefundReceiptImagesProps {
  evidence?: RefundEvidence;
  label?: string;
}

export function RefundReceiptImages({ evidence, label = 'Chứng từ chuyển khoản' }: RefundReceiptImagesProps) {
  const images = getRefundEvidenceImages(evidence);
  if (images.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold text-neutral-500">
        {label} ({images.length})
      </span>
      <div className="flex flex-wrap gap-2">
        {images.map((url, index) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noreferrer"
            title={`Xem chứng từ ${index + 1}`}
            className="relative w-14 h-14 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 hover:opacity-80 transition-opacity"
          >
            <Image src={url} alt={`${label} ${index + 1}`} fill className="object-cover" unoptimized />
          </a>
        ))}
      </div>
    </div>
  );
}
