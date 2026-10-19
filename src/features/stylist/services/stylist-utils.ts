import { toOutfitSuggestions } from '@/features/stylist/services/outfit-suggestions';
import type { StylistAnalysisRequest, StylistResult, StylistResultDto } from '@/features/stylist/types/stylist';

export function extractErrorMessage(error: unknown): string {
  if (!error) return 'Không xác định được lỗi.';
  const data = error instanceof Error && 'response' in error
    ? (error.response as { data?: { message?: string | string[]; error?: string } })?.data
    : undefined;
  if (data?.message) {
    const message = data.message;
    return Array.isArray(message) ? message[0] : message;
  }
  if (data?.error) return data.error;
  if (error instanceof Error) return error.message;
  return 'Đã xảy ra lỗi không xác định.';
}

/** Lỗi nhập liệu chặn gửi yêu cầu (khớp validate của BE), null nếu hợp lệ. */
export function validateStylistRequest(payload: StylistAnalysisRequest): string | null {
  if (payload.humanImage && !payload.imageConsent) {
    return 'Vui lòng xác nhận đồng ý cho FashionAI dùng ảnh để phân tích, hoặc xoá ảnh để tư vấn không cần ảnh.';
  }
  const hasContext = [payload.productId, payload.garmentDescription, payload.occasion, payload.stylePreference]
    .some((value) => Boolean(value?.trim()));
  if (!payload.humanImage && !hasContext) {
    return 'Vui lòng tải ảnh, chọn sản phẩm, dịp mặc hoặc phong cách để AI tư vấn.';
  }
  return null;
}

export function buildFormData(payload: StylistAnalysisRequest): FormData {
  const formData = new FormData();
  if (payload.humanImage) {
    formData.append('humanImage', payload.humanImage);
    // BE trả 400 nếu có ảnh mà thiếu imageConsent='true'.
    if (payload.imageConsent) formData.append('imageConsent', 'true');
  }
  if (payload.productId) formData.append('productId', payload.productId);
  if (payload.garmentDescription) formData.append('garmentDescription', payload.garmentDescription);
  if (payload.occasion) formData.append('occasion', payload.occasion);
  if (payload.stylePreference) formData.append('stylePreference', payload.stylePreference);
  if (payload.budget) formData.append('budget', payload.budget);
  if (payload.genderPreference) formData.append('genderPreference', payload.genderPreference);
  return formData;
}

export function normalizeStylistResult(result: StylistResultDto): StylistResult {
  return {
    ...result,
    ...(result.analysisResult ?? {}),
    // Ghi sau cùng: analysisResult.outfits chỉ là id thô, bộ phối hiển thị là `outfits` top-level.
    outfits: toOutfitSuggestions(result.outfits),
  };
}
