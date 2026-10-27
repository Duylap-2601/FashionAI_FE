'use client';

import { tryOnButtonClassName, tryOnFocusRing } from '@/features/try-on/components/garment-slot';
import type { UploadZoneProps } from '@/features/try-on/types/upload-zone';
import { cn } from '@/lib/utils';
import { Camera as CameraIcon, Check, ImageUp, X } from 'lucide-react';
import Image from 'next/image';
import React, { useRef, useState } from 'react';

export function UploadZone({ onFileSelect, uploadedImage, onCameraSelect, disabled = false, error }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggingOver, setDraggingOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setDraggingOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  if (uploadedImage) {
    return (
      <div className="relative aspect-[3/4] w-full overflow-hidden border border-landing-line bg-landing-ivory">
        <Image src={uploadedImage} alt="Ảnh toàn thân đã chọn" fill sizes="(max-width: 1024px) 100vw, 560px" unoptimized className="object-contain" />
        <button
          type="button"
          disabled={disabled}
          aria-label="Bỏ ảnh đã chọn"
          onClick={() => onFileSelect(null)}
          className={cn('absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-[2px] border border-landing-line bg-landing-paper text-landing-obsidian transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50', tryOnFocusRing)}
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <p className="absolute inset-x-3 bottom-3 flex items-center gap-2 border border-landing-line bg-landing-paper px-3 py-2 text-xs text-landing-obsidian">
          <Check className="h-3.5 w-3.5 shrink-0 text-landing-sage-ink" strokeWidth={2} aria-hidden="true" />
          Ảnh đã sẵn sàng để thử
        </p>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDraggingOver(true); }}
      onDragLeave={() => setDraggingOver(false)}
      onDrop={handleDrop}
      className={cn(
        'relative flex aspect-[3/4] w-full flex-col items-center justify-center border border-dashed px-6 text-center transition-colors',
        draggingOver ? 'border-landing-oxblood bg-landing-oxblood/[0.04]' : error ? 'border-destructive/60 bg-landing-ivory/60' : 'border-landing-taupe bg-landing-ivory/60',
        disabled && 'pointer-events-none opacity-70',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => { if (e.target.files?.[0]) onFileSelect(e.target.files[0]); e.currentTarget.value = ''; }}
      />
      <span className="flex h-12 w-12 items-center justify-center border border-landing-line text-landing-oxblood" aria-hidden="true">
        <ImageUp className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <p className="mt-5 font-display text-2xl leading-tight text-landing-obsidian">Thả ảnh toàn thân vào đây</p>
      <p className="mt-2 max-w-[260px] text-sm text-landing-muted">Đứng thẳng, đủ sáng, thấy rõ từ vai tới chân.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()} className={tryOnButtonClassName('primary', 'sm')}>
          Chọn ảnh
        </button>
        <button type="button" disabled={disabled} onClick={onCameraSelect} className={tryOnButtonClassName('outline', 'sm')}>
          <CameraIcon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
          Chụp ảnh
        </button>
      </div>
      <p className="mt-4 font-mono text-[11px] text-landing-muted">PNG, JPG · tối đa 10MB</p>
      {error ? <p className="mt-3 max-w-[300px] text-sm text-destructive" role="alert">{error}</p> : null}
    </div>
  );
}
