/** Dáng của hình minh họa số đo; chỉ đổi hình, không lưu lên backend. */
export type FigureVariant = 'female' | 'male';

export type Tab = 'measurements' | 'sizes';

export interface MeasurementField {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  desc: string;
  requiredFor?: string;
  svgY?: string | null;
}
