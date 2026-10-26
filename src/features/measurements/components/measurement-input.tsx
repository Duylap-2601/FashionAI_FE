'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { allMeasurementFields } from '@/features/measurements/constants/profile-measurements-page';
import { validate } from '@/features/measurements/services/measurement-validation';
import type { MeasurementField } from '@/features/measurements/types/profile-measurements-page';
import { accountFocusRing, accountInputClassName } from '@/features/profile/components/account-ui';
import { cn } from '@/lib/utils';
import { AlertCircle, Check, HelpCircle } from 'lucide-react';

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
  const inputId = `measurement-${field.id}`;
  const hintId = `${inputId}-hint`;

  return (
    <div>
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <label htmlFor={inputId} className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm text-landing-obsidian">
          <span>{field.label}</span>
          {field.requiredFor ? (
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-landing-brass-ink">{field.requiredFor}</span>
          ) : null}
          {isDirty ? (
            <span className="self-center">
              <span aria-hidden="true" className="block h-1.5 w-1.5 rounded-full bg-landing-oxblood" />
              <span className="sr-only">Đã sửa, chưa lưu</span>
            </span>
          ) : null}
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`Cách đo ${field.label.toLowerCase()}`}
              className={cn('-mr-1.5 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center text-landing-muted transition-colors hover:text-landing-oxblood', accountFocusRing)}
            >
              <HelpCircle className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            sideOffset={6}
            className="w-64 rounded-[2px] border-landing-line bg-landing-paper p-3 text-sm text-landing-obsidian shadow-sm"
          >
            <p className="font-medium">{field.label}</p>
            <p className="mt-1 text-landing-muted">{field.desc}</p>
          </PopoverContent>
        </Popover>
      </div>
      <div className="relative">
        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          min={field.min}
          max={field.max}
          step="any"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={isValid === false ? true : undefined}
          aria-describedby={hintId}
          className={cn(
            accountInputClassName,
            'pr-16 font-mono [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            isValid === false && 'border-destructive hover:border-destructive',
          )}
        />
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1.5">
          {isValid === true ? <Check className="h-3.5 w-3.5 text-landing-sage-ink" strokeWidth={2} aria-hidden="true" /> : null}
          {isValid === false ? <AlertCircle className="h-3.5 w-3.5 text-destructive" strokeWidth={1.75} aria-hidden="true" /> : null}
          <span className="font-mono text-xs text-landing-muted">{field.unit}</span>
        </div>
      </div>
      <p id={hintId} className={cn('mt-1 text-xs', isValid === false ? 'text-destructive' : 'text-landing-muted')}>
        {isValid === false ? `Nhập từ ${field.min} đến ${field.max} ${field.unit}.` : `${field.min}–${field.max} ${field.unit}`}
      </p>
    </div>
  );
}
