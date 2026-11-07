'use client';

import { MeasurementInput } from '@/features/measurements/components/measurement-input';
import { allMeasurementFields } from '@/features/measurements/constants/profile-measurements-page';
import { validate } from '@/features/measurements/services/measurement-validation';
import type { MeasurementField } from '@/features/measurements/types/profile-measurements-page';
import { useUpdateOrderItemMeasurement } from '@/features/orders/hooks/useOrders';
import type { OrderItem } from '@/features/orders/types/orders';
import {
  accountButtonClassName,
  accountFocusRing,
  accountLabelClassName,
} from '@/features/profile/components/account-ui';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { Loader2, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

function buildInitialValues(item: OrderItem, fields: MeasurementField[]) {
  const snapshot = item.measurementSnapshot ?? {};
  const values: Record<string, string> = {};
  for (const field of fields) {
    const value = snapshot[field.id as keyof typeof snapshot];
    values[field.id] = value === null || value === undefined ? '' : String(value);
  }
  return values;
}

export function OrderItemMeasurementForm({ orderId, item }: { orderId: string; item: OrderItem }) {
  const review = item.measurementReview;
  const requested = review?.fields?.length ? review.fields : review?.requestedFields ?? [];
  const knownFields = new Set(allMeasurementFields.map((field) => field.id));
  const fieldIds = requested.length > 0
    ? requested.filter((id) => knownFields.has(id))
    : allMeasurementFields.map((field) => field.id);
  const fields = allMeasurementFields.filter((field) => fieldIds.includes(field.id));

  const [values, setValues] = useState<Record<string, string>>(() => buildInitialValues(item, fields));
  const [syncToProfile, setSyncToProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateMeasurement, isUpdatingMeasurement } = useUpdateOrderItemMeasurement();

  const initialValues = buildInitialValues(item, fields);
  const hasInvalidValue = fields.some(
    (field) => validate(field.id, values[field.id] ?? '', allMeasurementFields) === false,
  );

  const handleSubmit = async () => {
    setError(null);
    const measurementSnapshot: Record<string, number> = {};
    for (const field of fields) {
      const raw = (values[field.id] ?? '').trim();
      if (!raw) continue;
      measurementSnapshot[field.id] = Number(raw);
    }

    if (Object.keys(measurementSnapshot).length === 0) {
      setError('Vui lòng nhập ít nhất một số đo cần chỉnh.');
      return;
    }

    try {
      await updateMeasurement({
        orderId,
        orderItemId: item.id,
        measurementSnapshot,
        syncToProfile,
      });
      toast.success('Đã gửi số đo, shop sẽ kiểm tra lại.');
    } catch (e) {
      setError(getErrorMessage(e, 'Không thể gửi số đo. Vui lòng thử lại.'));
    }
  };

  return (
    <div className="rounded-[2px] border border-landing-brass/70 bg-landing-paper/70 p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={accountLabelClassName}>Shop cần bạn xem lại số đo</p>
          <p className="mt-1 text-sm leading-relaxed text-landing-obsidian">
            {review?.message || 'Vui lòng kiểm tra và chỉnh lại các số đo được yêu cầu.'}
          </p>
        </div>
        <span className="rounded-full border border-landing-line bg-landing-ivory px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-landing-brass-ink">
          {fields.length} thông số
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <MeasurementInput
            key={field.id}
            field={field}
            value={values[field.id] ?? ''}
            initialValue={initialValues[field.id] ?? ''}
            onChange={(value) => setValues((prev) => ({ ...prev, [field.id]: value }))}
          />
        ))}
      </div>

      <label className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-landing-muted">
        <input
          type="checkbox"
          checked={syncToProfile}
          onChange={(event) => setSyncToProfile(event.target.checked)}
          className={cn('mt-0.5 h-4 w-4 shrink-0 accent-landing-oxblood', accountFocusRing)}
        />
        <span>Lưu các số đo này vào hồ sơ cá nhân để dùng cho đơn sau.</span>
      </label>

      {error ? (
        <p role="alert" className="mt-3 border-l-2 border-destructive pl-2.5 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isUpdatingMeasurement || hasInvalidValue}
          className={accountButtonClassName('primary', 'sm')}
        >
          {isUpdatingMeasurement ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
          ) : (
            <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
          )}
          {isUpdatingMeasurement ? 'Đang gửi' : 'Gửi số đo'}
        </button>
      </div>
    </div>
  );
}
