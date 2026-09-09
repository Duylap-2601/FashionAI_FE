'use client';

import { allMeasurementFields } from '@/features/measurements/constants/profile-measurements-page';
import { validate } from '@/features/measurements/services/measurement-validation';
import type { MeasurementField } from '@/features/measurements/types/profile-measurements-page';
import {
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export function MeasurementInput({
  field,
  value,
  initialValue,
  onChange,
}: {
  field: MeasurementField;
  value: string;
  initialValue: string;
  onChange: (v: string) => void;
}) {
  const isValid = validate(field.id, value, allMeasurementFields);
  const isDirty = value !== initialValue;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <label className="text-label-md font-medium text-neutral-800 flex items-center gap-1.5 flex-wrap">
          <span>{field.label}</span>
          {field.requiredFor && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-navy/10 text-brand-navy">
              {field.requiredFor}
            </span>
          )}
          {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />}
        </label>
        <span className="text-label-sm text-neutral-400 text-right truncate">{field.desc}</span>
      </div>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="—"
          className={`w-full pl-3 pr-12 py-2.5 rounded-lg border text-body-md bg-white transition-colors focus:outline-none focus:ring-2
            ${isValid === false
              ? 'border-semantic-error focus:ring-semantic-error/20 focus:border-semantic-error'
              : isValid === true
                ? 'border-semantic-success focus:ring-semantic-success/20 focus:border-semantic-success'
                : 'border-neutral-300 focus:ring-brand-navy/20 focus:border-brand-navy'
            }`}
        />
        <div className="absolute inset-y-0 right-3 flex items-center gap-1.5 pointer-events-none">
          {isValid === true && <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success" />}
          {isValid === false && <AlertCircle className="w-3.5 h-3.5 text-semantic-error" />}
          <span className="text-neutral-400 text-body-sm font-medium">{field.unit}</span>
        </div>
      </div>
      <p className="mt-1 text-label-sm text-neutral-400">
        {isValid === false ? `Phải từ ${field.min}–${field.max} ${field.unit}` : `${field.min}–${field.max} ${field.unit}`}
      </p>
    </div>
  );
}
