'use client';

import type { UploadZoneProps } from '@/features/try-on/types/upload-zone';
import { Camera as CameraIcon, CheckCircle2, CloudUpload, X } from 'lucide-react';
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
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-[#E5DFD5] bg-white">
        <Image src={uploadedImage} alt="Ảnh toàn thân đã chọn" fill sizes="(max-width: 1024px) 100vw, 58vw" unoptimized className="object-contain p-2" />
        <button type="button" disabled={disabled} aria-label="Xóa ảnh đã chọn" onClick={() => onFileSelect(null)} className="absolute top-3 right-3 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center border border-[#E5DFD5] shadow-sm hover:bg-white transition-colors disabled:cursor-not-allowed disabled:opacity-50">
          <X className="w-4 h-4 text-neutral-600" />
        </button>
        <div className="absolute bottom-3 inset-x-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-lg border border-[#E5DFD5]">
            <CheckCircle2 className="w-4 h-4 text-semantic-success shrink-0" />
            <span className="text-body-sm text-neutral-700 truncate">Ảnh cá nhân đã sẵn sàng</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onDragOver={(e) => { e.preventDefault(); if (!disabled) setDraggingOver(true); }} onDragLeave={() => setDraggingOver(false)} onDrop={handleDrop} className={`relative flex aspect-[3/4] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${draggingOver ? 'border-[#5D1C34] bg-[#5D1C34]/5' : error ? 'border-red-300 bg-red-50/40' : 'border-[#E5DFD5] bg-white hover:border-[#5D1C34]/60'} ${disabled ? 'pointer-events-none opacity-70' : ''}`}>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg" disabled={disabled} className="hidden" onChange={(e) => { if (e.target.files?.[0]) onFileSelect(e.target.files[0]); e.currentTarget.value = ''; }} />
      <div className="flex flex-col items-center gap-3 text-center px-6">
        <button type="button" disabled={disabled} aria-label="Chọn ảnh từ máy tính" className="w-[60px] h-[60px] rounded-2xl bg-[#5D1C34]/8 flex items-center justify-center cursor-pointer border-0 disabled:cursor-not-allowed" onClick={() => inputRef.current?.click()}><CloudUpload className="w-[32px] h-[32px] text-[#5D1C34]" /></button>
        <div className="flex flex-col gap-1">
          <p className="text-body-md text-neutral-700 font-medium">Kéo thả ảnh toàn thân vào đây</p>
          <button type="button" disabled={disabled} className="text-body-sm text-[#5D1C34] font-semibold underline underline-offset-2 bg-transparent border-0 cursor-pointer disabled:cursor-not-allowed" onClick={() => inputRef.current?.click()}>Chọn từ máy tính</button>
        </div>
        <div className="w-full flex items-center justify-center gap-2 my-2"><div className="h-px bg-neutral-200 flex-1" /><span className="text-label-sm text-neutral-400">hoặc</span><div className="h-px bg-neutral-200 flex-1" /></div>
        <button onClick={onCameraSelect} disabled={disabled} type="button" className="flex items-center gap-2 px-4 py-2 border border-[#E5DFD5] rounded-xl text-label-sm font-semibold text-neutral-700 bg-white hover:bg-neutral-50 transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-60">
          <CameraIcon className="w-4 h-4 text-brand-navy" /> Chụp ảnh selfie
        </button>
        <p className="text-label-sm text-neutral-500 mt-2">PNG, JPG tối đa 10MB</p>
        {error && <p className="text-label-sm font-medium text-red-600" role="alert">{error}</p>}
      </div>
    </div>
  );
}
