'use client';

import { BodyDiagram } from '@/features/measurements/components/body-diagram';
import { MeasurementInput } from '@/features/measurements/components/measurement-input';
import { SectionHeader } from '@/features/measurements/components/section-header';
import {
  allMeasurementFields,
  LOWER_FIELDS,
  MEASUREMENT_CATEGORY_LABELS,
  OVERVIEW_FIELDS,
  UPPER_FIELDS,
} from '@/features/measurements/constants/profile-measurements-page';
import { useMeasurements } from '@/features/measurements/hooks/useMeasurements';
import { useMeasurementsCompleteness } from '@/features/measurements/hooks/useMeasurementsCompleteness';
import { validate } from '@/features/measurements/services/measurement-validation';
import { queryKeys as measurementsQueryKeys } from '@/features/measurements/services/query-keys';
import type { FigureVariant, MeasurementField } from '@/features/measurements/types/profile-measurements-page';
import { accountButtonClassName, accountFocusRing, accountLabelClassName } from '@/features/profile/components/account-ui';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const FIELD_GROUPS: { title: string; subtitle: string; fields: MeasurementField[] }[] = [
  { title: 'Tổng quan', subtitle: 'Chiều cao, cân nặng', fields: OVERVIEW_FIELDS },
  { title: 'Thân trên', subtitle: 'Áo sơ mi, blazer, vest', fields: UPPER_FIELDS },
  { title: 'Thân dưới', subtitle: 'Quần tây, chân váy', fields: LOWER_FIELDS },
];

const FIGURE_OPTIONS: { id: FigureVariant; label: string }[] = [
  { id: 'female', label: 'Nữ' },
  { id: 'male', label: 'Nam' },
];

function SavedReadiness() {
  const { byCategory, isLoading, isError } = useMeasurementsCompleteness();
  if (isLoading) return <div className="h-16 animate-pulse bg-landing-taupe/30" />;
  if (isError || byCategory.length === 0) return null;

  return (
    <div>
      <p className={accountLabelClassName}>Đủ để đặt may</p>
      <ul className="mt-2 divide-y divide-landing-line/60">
        {byCategory.map((category) => (
          <li key={category.category} className="flex items-baseline justify-between gap-3 py-2 text-sm">
            <span className="text-landing-obsidian">{MEASUREMENT_CATEGORY_LABELS[category.category] ?? category.category}</span>
            {category.complete ? (
              <span className="inline-flex items-center gap-1 text-landing-sage-ink">
                <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" /> Đủ
              </span>
            ) : (
              <span className="text-landing-brass-ink" title={category.missing.map((field) => field.label).join(', ')}>
                Thiếu {category.missing.length}
              </span>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-1 text-xs text-landing-muted">Tính theo số đo đã lưu.</p>
    </div>
  );
}

export function MeasurementsTab() {
  const { measurements, isLoading, updateMeasurements, isUpdating } = useMeasurements();
  const queryClient = useQueryClient();

  const [initialValues, setInitialValues] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [figure, setFigure] = useState<FigureVariant>('female');

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

  const changedCount = allMeasurementFields.filter(f => (values[f.id] || '') !== (initialValues[f.id] || '')).length;
  const isDirty = changedCount > 0;
  const allValid = allMeasurementFields.every(f => {
    const val = values[f.id];
    if (!val || String(val).trim() === '') return true;
    return validate(f.id, String(val), allMeasurementFields) === true;
  });

  const set = (id: string, v: string) => setValues(p => ({ ...p, [id]: v }));
  const resetChanges = () => setValues({ ...initialValues });

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
        toast.success('Đã lưu số đo');
        setInitialValues({ ...values });
        queryClient.invalidateQueries({ queryKey: measurementsQueryKeys.measurementsCompleteness() });
      },
      onError: (err: unknown) => {
        const msg = getErrorMessage(err, 'Không thể lưu số đo.');
        toast.error(`Lỗi: ${Array.isArray(msg) ? msg[0] : msg}`);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="grid gap-10 xl:grid-cols-[210px_minmax(0,1fr)]">
        <div className="h-[360px] animate-pulse bg-landing-taupe/30" />
        <div className="space-y-4">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="h-16 animate-pulse bg-landing-taupe/30" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {isDirty ? (
        <div
          role="status"
          className="sticky top-[73px] z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-y border-landing-line bg-landing-paper px-4 py-3 md:mx-0 md:border-x"
        >
          <p className="flex items-center gap-2 text-sm text-landing-obsidian">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-landing-oxblood" />
            {changedCount} số đo chưa lưu
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={resetChanges} disabled={isUpdating} className={accountButtonClassName('outline', 'sm')}>
              Hoàn tác
            </button>
            <button type="button" onClick={handleSave} disabled={!allValid || isUpdating} className={accountButtonClassName('primary', 'sm')}>
              {isUpdating ? 'Đang lưu' : 'Lưu'}
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-10 xl:grid-cols-[210px_minmax(0,1fr)] xl:gap-12">
        <aside className="grid grid-cols-[132px_minmax(0,1fr)] gap-5 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-8 xl:sticky xl:top-[105px] xl:grid-cols-1 xl:self-start">
          <div className="border border-landing-line bg-landing-ivory/50 px-3 pb-4 pt-3">
            <div role="group" aria-label="Dáng của hình minh họa" className="mb-3 grid grid-cols-2 border border-landing-line">
              {FIGURE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={figure === option.id}
                  onClick={() => setFigure(option.id)}
                  className={cn(
                    'h-8 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors',
                    figure === option.id ? 'bg-landing-obsidian text-landing-paper' : 'text-landing-muted hover:text-landing-oxblood',
                    accountFocusRing,
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <BodyDiagram values={values} figure={figure} />
          </div>

          <div className="flex flex-col gap-6">
            <SavedReadiness />
            <p className="border-l-2 border-landing-brass pl-3 text-xs leading-relaxed text-landing-muted">
              Dùng thước dây mềm, đo sát người nhưng không siết. Nhờ người khác đo giúp sẽ chính xác hơn.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-10">
          {FIELD_GROUPS.map((group) => (
            <div key={group.title}>
              <SectionHeader title={group.title} subtitle={group.subtitle} />
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                {group.fields.map(f => (
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
          ))}

          <div className="flex flex-wrap items-center gap-3 border-t border-landing-line pt-6">
            <button type="button" onClick={handleSave} disabled={!isDirty || !allValid || isUpdating} className={accountButtonClassName('primary')}>
              {isUpdating ? 'Đang lưu số đo' : 'Lưu số đo'}
            </button>
            {isDirty ? (
              <button type="button" onClick={resetChanges} disabled={isUpdating} className={accountButtonClassName('outline')}>
                Hoàn tác
              </button>
            ) : null}
            {!allValid ? <p className="text-xs text-destructive">Sửa các ô đang báo lỗi trước khi lưu.</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
