import { getErrorMessage } from '@/lib/errors';

export function extractErrorMessage(error: unknown): string {
  if (!error) return 'Không xác định được lỗi.';
  return getErrorMessage(error, 'Đã xảy ra lỗi không xác định.');
}
