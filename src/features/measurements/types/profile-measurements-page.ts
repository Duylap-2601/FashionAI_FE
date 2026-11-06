/** Dáng của hình minh họa số đo; chỉ đổi hình, không lưu lên backend. */
export type FigureVariant = 'female' | 'male';

export type Tab = 'measurements' | 'sizes';

export type MeasurementFieldId =
  | 'height'
  | 'weight'
  | 'chest'
  | 'waist'
  | 'hip'
  | 'shoulder'
  | 'neck'
  | 'sleeveLength'
  | 'wrist'
  | 'thigh'
  | 'knee'
  | 'calf'
  | 'inseam'
  | 'outseam'
  | 'shirtLength'
  | 'underbust';

export interface MeasurementField {
  id: MeasurementFieldId;
  label: string;
  unit: string;
  min: number;
  max: number;
  desc: string;
  requiredFor?: string;
  svgY?: string | null;
}
