'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { allMeasurementFields } from '@/features/measurements/constants/profile-measurements-page';
import { validate } from '@/features/measurements/services/measurement-validation';
import type { MeasurementField } from '@/features/measurements/types/profile-measurements-page';
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle
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
      <div className="flex items-start justify-between mb-1.5 gap-2 min-h-[42px]">
        <label className="text-label-md font-medium text-neutral-800 flex items-center gap-1.5 flex-wrap min-w-0">
          <span>{field.label}</span>
          {field.requiredFor && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-navy/10 text-brand-navy">
              {field.requiredFor}
            </span>
          )}
          {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />}
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`Hướng dẫn đo ${field.label}`}
              className="mt-0.5 text-neutral-400 transition-colors hover:text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/20 rounded-full"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="end" sideOffset={8} className="w-64 rounded-xl border-neutral-200 p-3 text-body-sm text-neutral-700 shadow-lg">
            <p className="font-semibold text-neutral-900">{field.label}</p>
            <p className="mt-1">{field.desc}</p>
          </PopoverContent>
        </Popover>
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
