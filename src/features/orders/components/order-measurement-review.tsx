'use client';

import { allMeasurementFields } from '@/features/measurements/constants/profile-measurements-page';
import { MeasurementInput } from '@/features/measurements/components/measurement-input';
import { validate } from '@/features/measurements/services/measurement-validation';
import type { MeasurementField, MeasurementFieldId } from '@/features/measurements/types/profile-measurements-page';
import { useUpdateItemMeasurement } from '@/features/orders/hooks/useOrders';
import type { OrderItem } from '@/features/orders/types/orders';
import { accountButtonClassName } from '@/features/profile/components/account-ui';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const SNAPSHOT_ALIASES: Partial<Record<MeasurementFieldId, string>> = {
  shirtLength: 'bodyLength',
  outseam: 'trouserLength',
};

function toInputString(value: unknown): string {
  if (value === null || value === undefined) return '';
  const numeric = Number(value);
  return Number.isFinite(numeric) ? String(numeric) : '';
}

function readSnapshotValue(snapshot: Record<string, unknown>, fieldId: MeasurementFieldId): string {
  const direct = toInputString(snapshot[fieldId]);
  if (direct) return direct;
  const alias = SNAPSHOT_ALIASES[fieldId];
  return alias ? toInputString(snapshot[alias]) : '';
}

function getReviewFields(item: OrderItem): MeasurementField[] {
  const required = item.measurementRequiredFields ?? [];
  const requested = item.measurementReview?.requestedFields ?? item.measurementReview?.fields ?? [];
  const snapshot = (item.measurementSnapshot ?? {}) as Record<string, unknown>;
  const available = allMeasurementFields.filter((field) => field.id in snapshot);
  const ids = new Set<MeasurementFieldId>([...required, ...requested, ...available.map((field) => field.id)]);
  const requestedIds = new Set(requested);
  // Field shop yêu cầu lên đầu để khách thấy ngay, phần còn lại giữ thứ tự form.
  return allMeasurementFields
    .filter((field) => ids.has(field.id))
    .sort((a, b) => Number(requestedIds.has(b.id)) - Number(requestedIds.has(a.id)));
}

export function OrderMeasurementReview({ item, orderId }: { item: OrderItem; orderId: string }) {
  const review = item.measurementReview;
  const fields = useMemo(() => getReviewFields(item), [item]);
  const requiredIds = useMemo(
    () => new Set<MeasurementFieldId>(item.measurementRequiredFields ?? []),
    [item.measurementRequiredFields],
  );
  const requestedIds = useMemo(
    () => new Set<MeasurementFieldId>(
      item.measurementReview?.requestedFields ?? item.measurementReview?.fields ?? [],
    ),
    [item.measurementReview?.requestedFields, item.measurementReview?.fields],
  );
  const mandatoryIds = useMemo(
    () => new Set<MeasurementFieldId>([...requiredIds, ...requestedIds]),
    [requiredIds, requestedIds],
  );
  const missingIds = useMemo(
    () => new Set<MeasurementFieldId>(item.measurementMissingFields ?? []),
    [item.measurementMissingFields],
  );
  const { primaryFields, otherFields } = useMemo(() => {
    const primary = fields.filter((field) => requestedIds.has(field.id) || missingIds.has(field.id));
    if (primary.length === 0) return { primaryFields: fields, otherFields: [] as MeasurementField[] };
    const primarySet = new Set(primary.map((field) => field.id));
    return {
      primaryFields: primary,
      otherFields: fields.filter((field) => !primarySet.has(field.id)),
    };
  }, [fields, requestedIds, missingIds]);
  const initialValues = useMemo(() => {
    const snapshot = (item.measurementSnapshot ?? {}) as Record<string, unknown>;
    const values: Record<string, string> = {};
    for (const field of fields) {
      values[field.id] = readSnapshotValue(snapshot, field.id);
    }
    return values;
  }, [fields, item.measurementSnapshot]);

  const [values, setValues] = useState<Record<string, string>>(() => initialValues);
  const [syncToProfile, setSyncToProfile] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { updateItemMeasurement, isUpdatingMeasurement } = useUpdateItemMeasurement();

  if (!review || !['OPEN', 'SUBMITTED'].includes(review.status ?? '')) return null;

  if (review.status === 'SUBMITTED') {
    return (
      <div className="flex items-center gap-2 rounded-[2px] border border-landing-line bg-landing-ivory px-3 py-2.5 text-xs text-landing-sage-ink">
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-landing-sage" />
        Đã gửi số đo, chờ shop duyệt lại.
      </div>
    );
  }

  if (!review.editable) return null;

  const messageId = `measurement-review-message-${item.id}`;
  const fieldPrefix = `measurement-${item.id}`;

  const handleSubmit = () => {
    const emptyRequired = fields.filter((field) => mandatoryIds.has(field.id) && !(values[field.id] ?? '').trim());
    const invalidFields = fields.filter((field) => {
      const value = values[field.id] ?? '';
      if (!value.trim()) return false;
      return validate(field.id, value, allMeasurementFields) !== true;
    });
    if (emptyRequired.length > 0 || invalidFields.length > 0) {
      setFormError(
        emptyRequired.length > 0
          ? `Vui lòng điền đủ số đo shop yêu cầu/bắt buộc: ${emptyRequired.map((field) => field.label).join(', ')}.`
          : 'Có số đo chưa hợp lệ, vui lòng kiểm tra các ô được đánh dấu.',
      );
      return;
    }

    const measurementSnapshot: Record<string, number | null> = {};
    for (const field of fields) {
      const value = (values[field.id] ?? '').trim();
      measurementSnapshot[field.id] = value ? Number(value) : null;
    }

    setFormError(null);
    updateItemMeasurement(
      { orderId, itemId: item.id, measurementSnapshot, syncToProfile },
      {
        onSuccess: () => toast.success('Đã gửi số đo, chờ shop duyệt lại.'),
        onError: (error) => {
          setFormError(getErrorMessage(error, 'Không thể gửi số đo. Vui lòng thử lại.'));
        },
      },
    );
  };

  const renderField = (field: MeasurementField) => {
    const requested = requestedIds.has(field.id);
    const missing = missingIds.has(field.id);
    return (
      <MeasurementInput
        key={field.id}
        field={field}
        value={values[field.id] ?? ''}
        initialValue={initialValues[field.id] ?? ''}
        highlighted={requested || missing}
        highlightLabel={requested ? 'Shop yêu cầu' : 'Cần bổ sung'}
        compact
        onChange={(next) => setValues((current) => ({ ...current, [field.id]: next }))}
        idPrefix={fieldPrefix}
      />
    );
  };

  return (
    <div className="rounded-[2px] border border-landing-line bg-landing-ivory">
      <fieldset aria-busy={isUpdatingMeasurement} aria-describedby={review.message ? messageId : undefined}>
        <legend className="sr-only">Shop cần bạn xem lại số đo</legend>

        <div className="flex items-start justify-between gap-3 border-b border-landing-line/70 px-3.5 py-3">
          <div className="min-w-0">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-landing-brass-ink">
              Shop cần bạn xem lại số đo
            </p>
            {review.message ? (
              <p id={messageId} className="mt-1 line-clamp-3 text-xs leading-relaxed text-landing-obsidian">
                {review.message}
              </p>
            ) : null}
          </div>
          <span className="shrink-0 rounded-[2px] border border-landing-brass/40 bg-landing-brass/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-landing-brass-ink">
            {requestedIds.size > 0 ? `${requestedIds.size} yêu cầu` : `${primaryFields.length} ô`}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-x-4 gap-y-3 px-3.5 py-3.5 sm:grid-cols-2">
          {primaryFields.map(renderField)}
        </div>

        {otherFields.length > 0 ? (
          <details className="mx-3.5 border-t border-landing-line/70 py-2.5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-medium text-landing-obsidian [&::-webkit-details-marker]:hidden">
              <span>Các số đo khác</span>
              <span className="font-normal text-landing-muted">{otherFields.length} ô · chỉnh nếu cần</span>
            </summary>
            <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              {otherFields.map(renderField)}
            </div>
          </details>
        ) : null}

        {formError ? (
          <p role="alert" className="border-t border-destructive/20 bg-destructive/5 px-3.5 py-2 text-xs text-destructive">
            {formError}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-landing-line/70 px-3.5 py-3">
          <label className="flex items-center gap-2 text-[11px] text-landing-muted">
            <input
              type="checkbox"
              checked={syncToProfile}
              onChange={(event) => setSyncToProfile(event.target.checked)}
              className="h-3.5 w-3.5 accent-landing-oxblood"
            />
            Lưu vào hồ sơ số đo
          </label>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isUpdatingMeasurement}
            className={cn(accountButtonClassName('primary', 'sm'))}
          >
            {isUpdatingMeasurement ? 'Đang gửi' : 'Gửi số đo'}
          </button>
        </div>
      </fieldset>
    </div>
  );
}
