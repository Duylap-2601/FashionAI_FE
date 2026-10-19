import type { OutfitSuggestion } from '@/features/stylist/types/outfit-suggestion';

export interface StylistAnalysisRequest {
  /** Tùy chọn: không có ảnh thì AI tư vấn theo số đo, dịp mặc và phong cách. */
  humanImage?: File;
  /** Người dùng đã đồng ý cho dùng ảnh; BE bắt buộc khi có `humanImage`. */
  imageConsent?: boolean;
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

export type ColorSuggestion = string | { name?: string; color?: string; hex?: string | null };

/** Màu đã chuẩn hoá để hiển thị: hex null khi kết quả không có mã màu (kết quả cũ chỉ có tên). */
export interface ColorSwatch {
  name: string;
  hex: string | null;
}

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
  // null khi không có ảnh và không suy ra được từ số đo: ẩn các khối tương ứng.
  bodyType: string | null;
  skinTone: string | null;
  personalColor: string | null;
  fitRecommendation: string;
  fitAdvice?: string | null;
  recommendedSize?: string | null;
  productCompatibilityScore?: number | null;
  colorSuggestions: string[] | { name: string; hex: string | null }[];
  outfitCombinations: OutfitCombination[] | string[];
  stylingTips: string;
  verdict: string;
  warnings?: string[];
  /** Id thô BE lưu lại; bộ phối đã hydrate để hiển thị là `StylistResult.outfits`. */
  outfits?: unknown;
}

export interface StylistResult extends Partial<Omit<StylistAnalysisResult, 'outfits'>> {
  id: string;
  /** Ảnh không còn được lưu: kết quả mới luôn null, lịch sử cũ có thể còn URL. */
  humanImageUrl?: string | null;
  hasImage?: boolean;
  /** Bộ phối từ sản phẩm thật; [] với lịch sử cũ (khi đó dùng `outfitCombinations`). */
  outfits: OutfitSuggestion[];
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
  warnings?: string[];
}

/** Kết quả BE trả về, trước khi `normalizeStylistResult` kiểm tra `outfits`. */
export type StylistResultDto = Omit<StylistResult, 'outfits'> & { outfits?: unknown };

export interface StylistHistoryMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
