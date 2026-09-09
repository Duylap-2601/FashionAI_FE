export type BodyType = 'slim' | 'regular' | 'athletic' | 'plus';

export type Gender = 'male' | 'female' | 'other';

export type Tab = 'profile' | 'measurements' | 'sizes';

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
