export interface AvatarMeasurements {
  height: number;
  weight: number;
  chest: number;
  waist: number;
  hip: number;
  shoulder: number;
}

export interface GenerateAvatarDto {
  gender: 'male' | 'female';
  height: number;
  weight: number;
  chest: number;
  waist: number;
  hip: number;
  shoulder: number;
  draco?: boolean;
  morph?: boolean;
}

export interface AvatarResult {
  id: string;
  gender: 'male' | 'female';
  glbUrl: string;
  isCached: boolean;
  createdAt: string;
  measurements: {
    height: number | null;
    weight: number | null;
    chest: number | null;
    waist: number | null;
    hip: number | null;
    shoulder: number | null;
  };
  measuredCm?: Record<string, number>;
  timingS?: Record<string, number>;
}

export type SizePresetName = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export const SIZE_PRESETS: Record<'female' | 'male', Record<SizePresetName, AvatarMeasurements>> = {
  female: {
    XS:  { height: 155, weight: 46, chest: 80, waist: 62, hip: 86, shoulder: 36 },
    S:   { height: 159, weight: 51, chest: 84, waist: 66, hip: 90, shoulder: 37.5 },
    M:   { height: 162, weight: 56, chest: 88, waist: 70, hip: 94, shoulder: 39 },
    L:   { height: 166, weight: 62, chest: 93, waist: 76, hip: 99, shoulder: 40.5 },
    XL:  { height: 168, weight: 68, chest: 98, waist: 82, hip: 104, shoulder: 42 },
    XXL: { height: 170, weight: 75, chest: 104, waist: 88, hip: 110, shoulder: 43.5 },
  },
  male: {
    XS:  { height: 162, weight: 52, chest: 84, waist: 70, hip: 86, shoulder: 40 },
    S:   { height: 168, weight: 60, chest: 89, waist: 75, hip: 90, shoulder: 42 },
    M:   { height: 173, weight: 68, chest: 95, waist: 80, hip: 96, shoulder: 44.5 },
    L:   { height: 177, weight: 76, chest: 101, waist: 86, hip: 101, shoulder: 46.5 },
    XL:  { height: 181, weight: 85, chest: 107, waist: 92, hip: 107, shoulder: 48.5 },
    XXL: { height: 185, weight: 95, chest: 114, waist: 99, hip: 113, shoulder: 50.5 },
  },
};
