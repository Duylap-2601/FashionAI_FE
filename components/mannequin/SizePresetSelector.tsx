'use client';

import React, { useState } from 'react';
import {
  Sparkles, Ruler, RefreshCw, CheckCircle2,
  Sliders, User, HelpCircle, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import { SIZE_PRESETS, SizePresetName, AvatarMeasurements } from '@/types/avatar';
import { useGenerateAvatar, resolveGlbUrl } from '@/hooks/useAvatar';
import { useMeasurements, useUserProfile } from '@/hooks/useMeasurements';

export interface SizePresetSelectorProps {
  gender: 'male' | 'female';
  onGenderChange: (gender: 'male' | 'female') => void;
  measurements: AvatarMeasurements;
  onMeasurementsChange: (measurements: AvatarMeasurements) => void;
  currentGlbUrl?: string | null;
  onGlbUrlChange?: (url: string | null) => void;
}

export default function SizePresetSelector({
  gender,
  onGenderChange,
  measurements,
  onMeasurementsChange,
  currentGlbUrl,
  onGlbUrlChange,
}: SizePresetSelectorProps) {
  const { measurements: myMeasurements } = useMeasurements();
  const { profile } = useUserProfile();
  const { generateAvatarAsync, isGenerating, error } = useGenerateAvatar();

  const [selectedPreset, setSelectedPreset] = useState<SizePresetName | 'custom' | 'profile'>('M');
  const [showSliders, setShowSliders] = useState(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);

  const presets = SIZE_PRESETS[gender];
  const presetKeys: SizePresetName[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const hasMyMeasurements = Boolean(
    myMeasurements?.height &&
    myMeasurements?.weight &&
    myMeasurements?.chest &&
    myMeasurements?.waist &&
    myMeasurements?.hip
  );

  const handleSelectPreset = (key: SizePresetName) => {
    setSelectedPreset(key);
    onMeasurementsChange(presets[key]);
    if (onGlbUrlChange) onGlbUrlChange(null);
  };

  const handleSelectMyMeasurements = () => {
    if (!hasMyMeasurements || !myMeasurements) return;
    setSelectedPreset('profile');
    const userGender = (profile?.gender === 'male' || profile?.gender === 'female') ? profile.gender : gender;
    if (userGender !== gender) {
      onGenderChange(userGender);
    }
    onMeasurementsChange({
      height: myMeasurements.height || 162,
      weight: myMeasurements.weight || 56,
      shoulder: myMeasurements.shoulder || 39,
      chest: myMeasurements.chest || 88,
      waist: myMeasurements.waist || 70,
      hip: myMeasurements.hip || 94,
    });
    if (onGlbUrlChange) onGlbUrlChange(null);
  };

  const handleSliderChange = (key: keyof AvatarMeasurements, value: number) => {
    setSelectedPreset('custom');
    onMeasurementsChange({
      ...measurements,
      [key]: value,
    });
    if (onGlbUrlChange) onGlbUrlChange(null);
  };

  const handleGenerateBlenderAvatar = async () => {
    try {
      setGenerationNotice('Đang kết nối Blender pipeline...');
      const res = await generateAvatarAsync({
        gender,
        height: measurements.height,
        weight: measurements.weight,
        chest: measurements.chest,
        waist: measurements.waist,
        hip: measurements.hip,
        shoulder: measurements.shoulder,
        draco: true,
        morph: true,
      });

      const finalGlbUrl = resolveGlbUrl(res.glbUrl);
      if (finalGlbUrl && onGlbUrlChange) {
        onGlbUrlChange(finalGlbUrl);
      }

      if (res.isCached) {
        setGenerationNotice('Đã tải avatar 3D từ bộ nhớ đệm (Cache Hit)!');
      } else {
        setGenerationNotice('Đã sinh avatar 3D thành công từ Blender MPFB2!');
      }
      setTimeout(() => setGenerationNotice(null), 4000);
    } catch (err: any) {
      console.error('Failed to generate Blender avatar:', err);
      const msg = err?.response?.data?.message || err?.message || 'Không thể tạo Avatar 3D.';
      setGenerationNotice(`Lỗi: ${Array.isArray(msg) ? msg[0] : msg}`);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-sm flex flex-col gap-4">
      {/* Header: Gender & Mode */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <span className="text-body-sm font-semibold text-neutral-800">Chọn cỡ Mannequin</span>
          {currentGlbUrl && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> Avatar 3D Active
            </span>
          )}
        </div>

        {/* Gender Toggle */}
        <div className="flex bg-neutral-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => {
              onGenderChange('female');
              onMeasurementsChange(SIZE_PRESETS.female[selectedPreset === 'custom' || selectedPreset === 'profile' ? 'M' : selectedPreset]);
              if (onGlbUrlChange) onGlbUrlChange(null);
            }}
            className={`px-3 py-1 rounded-md text-label-xs font-semibold transition-all border-0 ${
              gender === 'female'
                ? 'bg-white text-[#5D1C34] shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700 bg-transparent'
            }`}
          >
            Nữ
          </button>
          <button
            type="button"
            onClick={() => {
              onGenderChange('male');
              onMeasurementsChange(SIZE_PRESETS.male[selectedPreset === 'custom' || selectedPreset === 'profile' ? 'M' : selectedPreset]);
              if (onGlbUrlChange) onGlbUrlChange(null);
            }}
            className={`px-3 py-1 rounded-md text-label-xs font-semibold transition-all border-0 ${
              gender === 'male'
                ? 'bg-white text-brand-navy shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700 bg-transparent'
            }`}
          >
            Nam
          </button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-label-xs font-medium text-neutral-500">Cỡ chuẩn phổ biến (Việt Nam)</span>
          {hasMyMeasurements && (
            <button
              type="button"
              onClick={handleSelectMyMeasurements}
              className={`text-label-xs font-semibold flex items-center gap-1 transition-colors border-0 bg-transparent cursor-pointer ${
                selectedPreset === 'profile'
                  ? 'text-brand-navy font-bold underline'
                  : 'text-neutral-500 hover:text-brand-navy'
              }`}
            >
              <Ruler className="w-3 h-3" /> Số đo của tôi
            </button>
          )}
        </div>

        <div className="grid grid-cols-6 gap-1.5">
          {presetKeys.map((key) => {
            const isSelected = selectedPreset === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectPreset(key)}
                className={`py-2 px-1 rounded-lg border text-center font-semibold text-body-sm transition-all ${
                  isSelected
                    ? 'border-brand-navy bg-brand-navy text-white shadow-sm scale-[1.02]'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300 hover:bg-white'
                }`}
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Summary Chips */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-2.5 bg-neutral-50 rounded-lg border border-neutral-100 text-center">
        <div>
          <span className="text-[10px] text-neutral-400 block">Chiều cao</span>
          <span className="text-label-xs font-bold text-brand-navy">{measurements.height} cm</span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-400 block">Cân nặng</span>
          <span className="text-label-xs font-bold text-brand-navy">{measurements.weight} kg</span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-400 block">Rộng vai</span>
          <span className="text-label-xs font-bold text-brand-navy">{measurements.shoulder} cm</span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-400 block">Vòng ngực</span>
          <span className="text-label-xs font-bold text-brand-navy">{measurements.chest} cm</span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-400 block">Vòng eo</span>
          <span className="text-label-xs font-bold text-brand-navy">{measurements.waist} cm</span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-400 block">Vòng mông</span>
          <span className="text-label-xs font-bold text-brand-navy">{measurements.hip} cm</span>
        </div>
      </div>

      {/* Advanced Slider Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowSliders(!showSliders)}
          className="w-full flex items-center justify-between py-2 text-label-xs font-semibold text-neutral-600 hover:text-brand-navy transition-colors bg-transparent border-0 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            Tùy chỉnh chi tiết từng số đo
          </span>
          {showSliders ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showSliders && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-neutral-100 animate-in fade-in duration-200">
            {/* Height */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500 font-medium">Chiều cao</span>
                <span className="font-bold text-brand-navy">{measurements.height} cm</span>
              </div>
              <input
                type="range"
                min={140}
                max={210}
                value={measurements.height}
                onChange={(e) => handleSliderChange('height', parseInt(e.target.value))}
                className="w-full accent-brand-navy h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Weight */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500 font-medium">Cân nặng</span>
                <span className="font-bold text-brand-navy">{measurements.weight} kg</span>
              </div>
              <input
                type="range"
                min={35}
                max={150}
                value={measurements.weight}
                onChange={(e) => handleSliderChange('weight', parseInt(e.target.value))}
                className="w-full accent-brand-navy h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Shoulder */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500 font-medium">Rộng vai</span>
                <span className="font-bold text-brand-navy">{measurements.shoulder} cm</span>
              </div>
              <input
                type="range"
                min={30}
                max={70}
                step={0.5}
                value={measurements.shoulder}
                onChange={(e) => handleSliderChange('shoulder', parseFloat(e.target.value))}
                className="w-full accent-brand-navy h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Chest */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500 font-medium">Vòng ngực</span>
                <span className="font-bold text-brand-navy">{measurements.chest} cm</span>
              </div>
              <input
                type="range"
                min={60}
                max={140}
                value={measurements.chest}
                onChange={(e) => handleSliderChange('chest', parseInt(e.target.value))}
                className="w-full accent-brand-navy h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Waist */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500 font-medium">Vòng eo</span>
                <span className="font-bold text-brand-navy">{measurements.waist} cm</span>
              </div>
              <input
                type="range"
                min={50}
                max={130}
                value={measurements.waist}
                onChange={(e) => handleSliderChange('waist', parseInt(e.target.value))}
                className="w-full accent-brand-navy h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Hip */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-500 font-medium">Vòng mông</span>
                <span className="font-bold text-brand-navy">{measurements.hip} cm</span>
              </div>
              <input
                type="range"
                min={60}
                max={145}
                value={measurements.hip}
                onChange={(e) => handleSliderChange('hip', parseInt(e.target.value))}
                className="w-full accent-brand-navy h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Generator Action */}
      <div className="pt-2 border-t border-neutral-100 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleGenerateBlenderAvatar}
          disabled={isGenerating}
          className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-label-sm font-semibold transition-all border-0 shadow-sm ${
            isGenerating
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#181B24] to-[#2B3245] text-white hover:opacity-95 cursor-pointer'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-brand-gold" />
              <span>Blender đang tạo Avatar 3D theo số đo...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span>Sinh Avatar 3D chân thực (Blender Pipeline)</span>
            </>
          )}
        </button>

        {generationNotice && (
          <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 text-[11px] text-neutral-600 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-brand-navy shrink-0" />
            <span>{generationNotice}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Info(props: React.SVGProps<SVGSVGElement>) {
  return <HelpCircle {...props as any} />;
}
