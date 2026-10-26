'use client';

import type { ProductCutoutImageProps } from '@/features/stylist/types/product-cutout-image';
import { Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Ảnh sản phẩm là PNG 3:4 đã tách nền, quanh món đồ còn ≥ ~9% trên/dưới và ≥ ~11% hai bên
// trong suốt. Khung ảnh được nới ra ngoài ô (6% dọc, 12% ngang) rồi `object-contain`: món đồ
// to hơn mà vẫn hiện trọn, phần bị ô cắt mất chỉ là nền trong suốt.
const IMAGE_BLEED_STYLE = { inset: '-6% -12%' } as const;

/** Một ô ảnh sản phẩm trong dải ảnh của thẻ gợi ý; bấm vào mở trang sản phẩm (nếu còn bán). */
export function ProductCutoutImage({ product, alt, onSelect }: ProductCutoutImageProps) {
  const content = product.image ? (
    <div className="absolute pointer-events-none transition-transform duration-300 group-hover/img:scale-[1.03]" style={IMAGE_BLEED_STYLE}>
      <Image
        src={product.image}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 200px, 50vw"
        className={`object-contain ${product.available ? '' : 'grayscale opacity-50'}`}
      />
    </div>
  ) : (
    <div className="w-full h-full flex items-center justify-center">
      <Package className="h-5 w-5 text-landing-taupe" strokeWidth={1.75} />
    </div>
  );

  if (!product.available) {
    return <div className="relative flex-1 min-w-0 h-full">{content}</div>;
  }
  return (
    <Link href={`/products/${product.id}`} onClick={() => onSelect(product)} className="group/img relative block flex-1 min-w-0 h-full">
      {content}
    </Link>
  );
}
