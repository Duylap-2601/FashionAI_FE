import type { StylistResult } from '@/features/stylist/types/stylist';

export interface StylistBriefSummaryProps {
  /** Kết quả đang xem: tóm tắt lấy từ chính yêu cầu đã tạo ra nó (kể cả kết quả lịch sử). */
  result: StylistResult | null;
  /** Ảnh vừa chọn trên form, chỉ dùng khi đang phân tích (chưa có kết quả). */
  photoUrl: string | null;
  isAnalyzing: boolean;
  onEdit: () => void;
}
