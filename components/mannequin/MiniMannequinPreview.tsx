'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AvatarMeasurements, MeasureField } from '@/types/avatar';
import { useAvatarPreset } from '@/hooks/useAvatarPreset';
import { Sparkles, RefreshCw, UserCheck } from 'lucide-react';

const MannequinViewer = dynamic(() => import('@/components/mannequin/MannequinViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-neutral-900 rounded-xl text-white/50 text-xs gap-2">
      <RefreshCw className="w-4 h-4 animate-spin text-brand-gold" />
      <span>Khởi tạo 3D Canvas...</span>
    </div>
  ),
});

export interface MiniMannequinPreviewProps {
  gender?: 'male' | 'female';
  measurements: Partial<AvatarMeasurements>;
  className?: string;
}

export default function MiniMannequinPreview({
  gender = 'female',
  measurements,
  className = '',
}: MiniMannequinPreviewProps) {
  // Debounce measurements 300ms to avoid excessive requests when typing
  const [debouncedMeasurements, setDebouncedMeasurements] = useState(measurements);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMeasurements(measurements);
    }, 300);
    return () => clearTimeout(handler);
  }, [measurements]);

  const height = debouncedMeasurements.height || (gender === 'female' ? 162 : 173);
  const weight = debouncedMeasurements.weight || (gender === 'female' ? 56 : 68);
  const shoulder = debouncedMeasurements.shoulder || (gender === 'female' ? 39 : 44.5);
  const chest = debouncedMeasurements.chest || (gender === 'female' ? 88 : 95);
  const waist = debouncedMeasurements.waist || (gender === 'female' ? 70 : 80);
  const hip = debouncedMeasurements.hip || (gender === 'female' ? 94 : 96);

  const { presetData, isLoading, isFetching } = useAvatarPreset({
    gender,
    height,
    weight,
    chest,
    waist,
    hip,
    shoulder,
  });

  const glbUrl = presetData?.preset?.glbUrl || null;
  const morphDeltasCm = presetData?.morphDeltasCm || null;
  const morphFactors = presetData?.morphFactors || null;

  return (
    <div className={`bg-white rounded-2xl p-3.5 border border-neutral-200 shadow-sm flex flex-col gap-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-brand-gold" />
          <span className="text-label-sm font-bold text-neutral-800">Mô phỏng 3D thời gian thực</span>
        </div>
        {(isLoading || isFetching) && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Đồng bộ 3D...
          </span>
        )}
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-inner" style={{ height: 320 }}>
        <MannequinViewer
          height={height}
          weight={weight}
          shoulder={shoulder}
          chest={chest}
          waist={waist}
          hip={hip}
          gender={gender}
          glbUrl={glbUrl}
          morphDeltasCm={morphDeltasCm}
          morphFactors={morphFactors}
          isPresetGlb={Boolean(glbUrl)}
          autoRotate={false}
        />
      </div>

      {/* Quick Specs Footer */}
      <div className="grid grid-cols-3 gap-1.5 p-2 bg-neutral-50 rounded-xl border border-neutral-100 text-center font-mono text-[11px]">
        <div>
          <span className="text-[10px] text-neutral-400 block font-sans">Chiều cao/Nặng</span>
          <span className="font-bold text-neutral-700">{height}cm/{weight}kg</span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-400 block font-sans">Ngực - Eo - Mông</span>
          <span className="font-bold text-neutral-700">{chest}-{waist}-{hip}</span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-400 block font-sans">Rộng vai</span>
          <span className="font-bold text-neutral-700">{shoulder}cm</span>
        </div>
      </div>
    </div>
  );
}
