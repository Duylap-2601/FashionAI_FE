'use client';

import { ImageLightbox } from '@/components/ui/image-lightbox';
import { cn } from '@/components/ui/utils';
import { ImagePlus, X, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export interface ImageFilePreviewItem {
  id: string;
  url: string;
  file: File;
}

interface ImageFilePreviewsProps {
  items: ImageFilePreviewItem[];
  onRemove: (id: string) => void;
  /** Shows an "add more" tile when provided. */
  onAdd?: () => void;
  addLabel?: string;
  disabled?: boolean;
  className?: string;
  /** Size, radius and border of each tile, so callers keep their own look. */
  tileClassName?: string;
}

/**
 * Thumbnails of images picked for upload, before they are sent. Clicking a
 * thumbnail opens it full size so the uploader can check it is the right file.
 */
export function ImageFilePreviews({
  items,
  onRemove,
  onAdd,
  addLabel = 'Thêm ảnh',
  disabled = false,
  className,
  tileClassName,
}: ImageFilePreviewsProps) {
  const [zoomed, setZoomed] = useState<ImageFilePreviewItem | null>(null);

  if (items.length === 0) return null;

  return (
    <>
      <ul className={cn('flex flex-wrap gap-2', className)}>
        {items.map((item, index) => (
          <li
            key={item.id}
            className={cn('group relative size-20 overflow-hidden rounded-[2px] border border-landing-line bg-landing-ivory', tileClassName)}
          >
            <button
              type="button"
              onClick={() => setZoomed(item)}
              className="block size-full cursor-zoom-in"
              title={`Xem ảnh ${index + 1}: ${item.file.name}`}
            >
              <Image src={item.url} alt={`Ảnh ${index + 1}: ${item.file.name}`} fill sizes="96px" className="object-cover" unoptimized />
              <span className="absolute inset-0 flex items-center justify-center bg-landing-obsidian/0 text-landing-paper opacity-0 transition group-hover:bg-landing-obsidian/35 group-hover:opacity-100">
                <ZoomIn className="size-5" strokeWidth={1.75} />
              </span>
            </button>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              disabled={disabled}
              aria-label={`Bỏ ảnh ${index + 1}`}
              title="Bỏ ảnh này"
              className="absolute right-1 top-1 cursor-pointer rounded-[2px] bg-landing-obsidian/70 p-1 text-landing-paper transition-colors hover:bg-destructive disabled:opacity-40"
            >
              <X className="size-3.5" strokeWidth={2} />
            </button>
          </li>
        ))}
        {onAdd && (
          <li className={cn('size-20 rounded-[2px]', tileClassName, 'border-0 bg-transparent')}>
            <button
              type="button"
              onClick={onAdd}
              disabled={disabled}
              className="flex size-full cursor-pointer flex-col items-center justify-center gap-1 rounded-[inherit] border border-dashed border-landing-taupe text-[11px] text-landing-muted transition-colors hover:border-landing-oxblood hover:text-landing-oxblood disabled:opacity-40"
            >
              <ImagePlus className="size-5" strokeWidth={1.75} />
              <span>{addLabel}</span>
            </button>
          </li>
        )}
      </ul>

      <ImageLightbox
        image={zoomed ? { src: zoomed.url, alt: zoomed.file.name, caption: zoomed.file.name } : null}
        onClose={() => setZoomed(null)}
      />
    </>
  );
}
