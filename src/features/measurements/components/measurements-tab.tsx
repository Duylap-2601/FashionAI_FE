'use client';
import { getErrorMessage } from '@/lib/errors';


import { BodyDiagram } from '@/features/measurements/components/body-diagram';
import { MeasurementInput } from '@/features/measurements/components/measurement-input';
import { SectionHeader } from '@/features/measurements/components/section-header';
import { allMeasurementFields, LOWER_FIELDS, OVERVIEW_FIELDS, UPPER_FIELDS } from '@/features/measurements/constants/profile-measurements-page';
import { useMeasurements } from '@/features/measurements/hooks/useMeasurements';
import { validate } from '@/features/measurements/services/measurement-validation';
import { queryKeys as measurementsQueryKeys } from '@/features/measurements/services/query-keys';
import type { BodyType, Gender } from '@/features/measurements/types/profile-measurements-page';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Info,
  Save
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function MeasurementsTab() {
  const { measurements, isLoading, updateMeasurements, isUpdating } = useMeasurements();
  const queryClient = useQueryClient();

  const [initialValues, setInitialValues] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [bodyType, setBodyType] = useState<BodyType>('regular');
  const [gender, setGender] = useState<Gender>('female');

  const prefillDone = React.useRef(false);
  useEffect(() => {
    if (prefillDone.current) return;
    if (measurements && Object.keys(measurements).length > 0) {
      prefillDone.current = true;
      const validFieldIds = new Set(allMeasurementFields.map(f => f.id));
      const formatted: Record<string, string> = {};
      Object.entries(measurements).forEach(([k, v]) => {
        if (validFieldIds.has(k) && v !== undefined && v !== null) {
          formatted[k] = String(v);
        }
      });
      // Handle alias mapping
      if (!formatted.shirtLength && measurements.bodyLength) {
        formatted.shirtLength = String(measurements.bodyLength);
      }
      if (!formatted.outseam && measurements.trouserLength) {
        formatted.outseam = String(measurements.trouserLength);
      }

      setInitialValues(formatted);
      setValues(formatted);
    }
  }, [measurements]);

  const isDirty = allMeasurementFields.some(f => (values[f.id] || '') !== (initialValues[f.id] || ''));
  const allValid = allMeasurementFields.every(f => {
    const val = values[f.id];
    if (!val || String(val).trim() === '') return true;
    return validate(f.id, String(val), allMeasurementFields) === true;
  });

  const set = (id: string, v: string) => setValues(p => ({ ...p, [id]: v }));

  const handleSave = () => {
    if (!allValid) {
      toast.error('Vui lòng kiểm tra lại các số đo chưa hợp lệ');
      return;
    }
    const validFieldIds = new Set(allMeasurementFields.map(f => f.id));
    const body: Record<string, number> = {};
    Object.entries(values).forEach(([k, v]) => {
      if (validFieldIds.has(k) && v !== undefined && v !== '' && !isNaN(parseFloat(v))) {
        body[k] = parseFloat(v);
      }
    });

    // Provide aliases for backwards compatibility
    if (body.shirtLength !== undefined) body.bodyLength = body.shirtLength;
    if (body.outseam !== undefined) body.trouserLength = body.outseam;

    updateMeasurements(body, {
      onSuccess: () => {
        toast.success('Đã lưu số đo cơ thể thành công!');
        setInitialValues({ ...values });
        queryClient.invalidateQueries({ queryKey: measurementsQueryKeys.measurementsCompleteness() });
      },
      onError: (err: unknown) => {
        const msg = getErrorMessage(err, 'Không thể lưu số đo.');
        toast.error(`Lỗi: ${Array.isArray(msg) ? msg[0] : msg}`);
      }
    });
  };

  const bodyTypes: { id: BodyType; label: string; desc: string }[] = [
    { id: 'slim', label: 'Mảnh mai', desc: 'Vai hẹp, eo thon' },
    { id: 'regular', label: 'Cân đối', desc: 'Tỷ lệ hài hòa' },
    { id: 'athletic', label: 'Thể thao', desc: 'Vai rộng, cơ bắp' },
    { id: 'plus', label: 'Plus size', desc: 'Dáng đầy đặn' },
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 flex justify-center items-center h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {isDirty && (
        <div className="sticky top-[72px] z-20 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 text-amber-700 text-label-sm font-medium">
            <AlertCircle className="w-4 h-4" /> Bạn có thay đổi chưa lưu
          </div>
          <div className="flex gap-2">
            <button onClick={() => setValues({ ...initialValues })} className="px-3 py-1.5 text-label-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Hủy</button>
            <button onClick={handleSave} disabled={!allValid || isUpdating} className="px-4 py-1.5 bg-brand-navy text-white rounded-lg text-label-sm font-medium hover:bg-brand-navy/90 transition-colors disabled:opacity-50">Lưu</button>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
        <Info className="w-4 h-4 text-semantic-info shrink-0 mt-0.5" />
        <p className="text-body-sm text-blue-700">Dùng thước dây mềm, đo sát người nhưng không siết. Nhờ người khác đo giúp sẽ cho kết quả chính xác hơn.</p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-6 md:px-8 py-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-heading-h3 font-semibold text-neutral-900">Số đo cơ thể</h2>
            <p className="text-body-sm text-neutral-500 mt-0.5">Giúp AI thử đồ chính xác và gợi ý size phù hợp</p>
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Sticky Visual Side */}
          <div className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-[88px]">
            <div className="bg-neutral-50 rounded-xl border border-neutral-100 p-5 flex flex-col items-center">
              <BodyDiagram values={values} gender={gender} />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-8">
            <div>
              <SectionHeader title="Tổng quan" subtitle="Thông tin cơ bản về cơ thể" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {OVERVIEW_FIELDS.map(f => (
                  <MeasurementInput
                    key={f.id}
                    field={f}
                    value={values[f.id] || ''}
                    initialValue={initialValues[f.id] || ''}
                    onChange={v => set(f.id, v)}
                  />
                ))}
              </div>
            </div>

            <div>
              <SectionHeader title="Dáng người" subtitle="Giúp AI tối ưu kết quả thử đồ" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {bodyTypes.map(bt => (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() => setBodyType(bt.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${bodyType === bt.id
                        ? 'border-brand-navy bg-brand-navy/5'
                        : 'border-neutral-200 hover:border-brand-navy/30 bg-white'
                      }`}
                  >
                    <span className={`text-label-md font-semibold ${bodyType === bt.id ? 'text-brand-navy' : 'text-neutral-700'}`}>
                      {bt.label}
                    </span>
                    <span className="text-label-sm text-neutral-500">{bt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <SectionHeader title="Thân trên" subtitle="Áo sơ mi, blazer, vest" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {UPPER_FIELDS.map(f => (
                  <MeasurementInput
                    key={f.id}
                    field={f}
                    value={values[f.id] || ''}
                    initialValue={initialValues[f.id] || ''}
                    onChange={v => set(f.id, v)}
                  />
                ))}
              </div>
            </div>

            <div>
              <SectionHeader title="Thân dưới" subtitle="Quần tây, chân váy" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {LOWER_FIELDS.map(f => (
                  <MeasurementInput
                    key={f.id}
                    field={f}
                    value={values[f.id] || ''}
                    initialValue={initialValues[f.id] || ''}
                    onChange={v => set(f.id, v)}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-5 border-t border-neutral-100">
              <button
                onClick={handleSave}
                disabled={!isDirty || !allValid || isUpdating}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-label-md font-semibold transition-all ${isDirty && allValid
                    ? 'bg-brand-navy text-white hover:bg-brand-navy/90 shadow-md'
                    : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  }`}
              >
                <Save className="w-4 h-4" /> {isUpdating ? 'Đang lưu số đo...' : 'Lưu số đo'}
              </button>
              {isDirty && (
                <button
                  onClick={() => setValues({ ...initialValues })}
                  className="px-6 py-2.5 rounded-xl text-label-md font-medium border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                  Hủy
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
