import type { MeasurementField } from '@/features/measurements/types/profile-measurements-page';

export function validate(id: string, value: string, allFields: MeasurementField[]): boolean | null {
  if (!value) return null;
  const num = parseFloat(value);
  const field = allFields.find(f => f.id === id);
  if (!field || isNaN(num)) return false;
  return num >= field.min && num <= field.max;
}
