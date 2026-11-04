'use client';

import { ImageLightbox } from '@/components/ui/image-lightbox';
import type { RefundEvidence } from '@/features/orders/types/orders';
import { getRefundEvidenceImages } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';

interface RefundReceiptImagesProps {
  evidence?: RefundEvidence;
  label?: string;
}

export function RefundReceiptImages({ evidence, label = 'Chứng từ chuyển khoản' }: RefundReceiptImagesProps) {
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const images = getRefundEvidenceImages(evidence);
  if (images.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-landing-brass-ink">
        {label} <span className="font-mono">({images.length})</span>
      </span>
      <div className="flex flex-wrap gap-2">
        {images.map((url, index) => (
          <button
            key={url}
            type="button"
            onClick={() => setZoomedIndex(index)}
            title={`Xem chứng từ ${index + 1}`}
            className="relative h-16 w-16 cursor-zoom-in overflow-hidden rounded-[2px] border border-landing-line bg-landing-ivory transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-oxblood"
          >
            <Image src={url} alt={`${label} ${index + 1}`} fill sizes="64px" className="object-cover" unoptimized />
          </button>
        ))}
      </div>
      <ImageLightbox
        image={zoomedIndex === null ? null : { src: images[zoomedIndex], alt: `${label} ${zoomedIndex + 1}`, caption: `${label} ${zoomedIndex + 1}/${images.length}` }}
        onClose={() => setZoomedIndex(null)}
      />
    </div>
  );
}
