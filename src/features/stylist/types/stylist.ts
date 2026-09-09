export interface StylistAnalysisRequest {
  humanImage: File;
  productId?: string;
  garmentDescription?: string;
  occasion?: string;
  stylePreference?: string;
  budget?: string;
  genderPreference?: 'male' | 'female' | 'other';
}

export interface OutfitItem {
  type: string;
  name: string;
}

export type ColorSuggestion = string | { name?: string; color?: string; hex?: string };

export interface OutfitCombination {
  name: string;
  items: OutfitItem[];
}

export interface StylistProduct {
  id: string;
  name: string;
  price?: string | number | null;
  garmentUrl?: string;
  images?: { imageUrl: string; isMain: boolean }[];
  color?: string | null;
  size?: string | null;
  description?: string | null;
}

export interface StylistAnalysisResult {
  bodyType: string;
  skinTone: string;
  personalColor: string;
  fitRecommendation: string;
  fitAdvice?: string | null;
  recommendedSize?: string | null;
  productCompatibilityScore?: number | null;
  colorSuggestions: string[] | { name: string; hex: string }[];
  outfitCombinations: OutfitCombination[] | string[];
  stylingTips: string;
  verdict: string;
}

export interface StylistResult extends Partial<StylistAnalysisResult> {
  id: string;
  humanImageUrl?: string;
  garmentDescription?: string;
  analysisResult?: StylistAnalysisResult;
  createdAt: string;
  occasion?: string;
  stylePreference?: string;
  budget?: string;
  genderPreference?: string;
  fitAdvice?: string | null;
  recommendedSize?: string | null;
  productCompatibilityScore?: number | null;
  product?: StylistProduct | null;
  model?: string;
}

export interface StylistHistoryMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
