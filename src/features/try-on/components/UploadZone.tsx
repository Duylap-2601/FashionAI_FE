'use client';

import type { UploadZoneProps } from '@/features/try-on/types/upload-zone';
import { Camera as CameraIcon, CheckCircle2, CloudUpload, X } from 'lucide-react';
import Image from 'next/image';
import React, { useRef, useState } from 'react';

export function UploadZone({ onFileSelect, uploadedImage, onCameraSelect }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggingOver, setDraggingOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  if (uploadedImage) {
    return (
      <div className="relative rounded-xl overflow-hidden border-2 border-brand-navy/20" style={{ width: '100%', height: 400 }}>
        <Image src={uploadedImage} alt="Uploaded" fill sizes="(max-width: 1024px) 100vw, 50vw" unoptimized className="object-cover" />
        <button onClick={() => onFileSelect(null)} className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
          <X className="w-4 h-4 text-neutral-600" />
        </button>
        <div className="absolute bottom-3 inset-x-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-semantic-success shrink-0" />
            <span className="text-body-sm text-neutral-700 truncate">Ảnh đã tải lên</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onDragOver={(e) => { e.preventDefault(); setDraggingOver(true); }} onDragLeave={() => setDraggingOver(false)} onDrop={handleDrop} className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all relative ${draggingOver ? 'border-brand-navy bg-brand-navy/5 scale-[1.01]' : 'border-neutral-300 bg-neutral-50 hover:border-brand-navy/50 hover:bg-brand-navy/[0.02]'}`} style={{ width: '100%', height: 400 }}>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => { if (e.target.files?.[0]) onFileSelect(e.target.files[0]); }} />
      <div className="flex flex-col items-center gap-3 text-center px-6">
        <div className="w-[60px] h-[60px] rounded-2xl bg-brand-navy/8 flex items-center justify-center cursor-pointer" onClick={() => inputRef.current?.click()}><CloudUpload className="w-[32px] h-[32px] text-brand-navy" /></div>
        <div className="flex flex-col gap-1">
          <p className="text-body-md text-neutral-700 font-medium cursor-pointer" onClick={() => inputRef.current?.click()}>Kéo thả ảnh vào đây</p>
          <p className="text-body-sm text-neutral-500">hoặc <span className="text-brand-navy font-semibold underline cursor-pointer" onClick={() => inputRef.current?.click()}>chọn từ máy tính</span></p>
        </div>
        <div className="w-full flex items-center justify-center gap-2 my-2"><div className="h-px bg-neutral-200 flex-1" /><span className="text-label-sm text-neutral-400">hoặc</span><div className="h-px bg-neutral-200 flex-1" /></div>
        <button onClick={onCameraSelect} type="button" className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-xl text-label-sm font-semibold text-neutral-700 bg-white hover:bg-neutral-50 transition-colors shadow-sm">
          <CameraIcon className="w-4 h-4 text-brand-navy" /> Chụp ảnh selfie
        </button>
        <p className="text-label-sm text-neutral-400 mt-2">PNG, JPG tối đa 10MB</p>
      </div>
    </div>
  );
}
