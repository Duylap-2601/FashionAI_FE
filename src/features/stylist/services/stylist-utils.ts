import type { StylistAnalysisRequest, StylistResult } from '@/features/stylist/types/stylist';

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

export function buildFormData(payload: StylistAnalysisRequest): FormData {
  const formData = new FormData();
  formData.append('humanImage', payload.humanImage);
  if (payload.productId) formData.append('productId', payload.productId);
  if (payload.garmentDescription) formData.append('garmentDescription', payload.garmentDescription);
  if (payload.occasion) formData.append('occasion', payload.occasion);
  if (payload.stylePreference) formData.append('stylePreference', payload.stylePreference);
  if (payload.budget) formData.append('budget', payload.budget);
  if (payload.genderPreference) formData.append('genderPreference', payload.genderPreference);
  return formData;
}

export function normalizeStylistResult(result: StylistResult): StylistResult {
  return {
    ...result,
    ...(result.analysisResult ?? {}),
  };
}
